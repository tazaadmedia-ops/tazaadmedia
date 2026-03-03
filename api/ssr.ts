import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    let html = '';

    // Determine Base URL Robustly (mainly for metadata generation now)
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
    const isLocal = host.includes('localhost');
    const baseUrl = isLocal ? `${protocol}://${host}` : (vercelUrl || `${protocol}://${host}`);

    try {
        let { slug } = request.query;

        if (!slug) return response.status(400).send('Missing slug');
        if (Array.isArray(slug)) slug = slug[0];

        if (typeof slug === 'string') {
            slug = slug.split('?')[0].trim();
            // Handle live/ prefixed slugs (live articles)
            if (slug.startsWith('live/')) {
                slug = slug.replace('live/', '');
            } else {
                // For normal articles, we still only want the first segment if there's any nesting
                slug = slug.split('/')[0];
            }
        }

        // 1. Fetch index.html using FILE SYSTEM (More reliable than fetch)
        try {
            // Debug output confirmed index.html is at /var/task/index.html which corresponds to process.cwd()
            // CRITICAL: We must prefer 'dist/index.html' (production build) over 'index.html' (dev/source).
            // The source index.html references /src/main.tsx which fails in production.
            const possiblePaths = [
                path.join(process.cwd(), 'dist', 'index.html'),
                path.join(process.cwd(), 'index.html'),
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    html = fs.readFileSync(p, 'utf-8');
                    break;
                }
            }
        } catch (e: any) {
            console.error(`[SSR] Exception loading index.html:`, e.message);
        }

        const errorPage = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SSR Debug</title>
                <style>
                    body { font-family: monospace; padding: 2rem; background: #333; color: #fff; white-space: pre-wrap; }
                    h1 { color: #ff6b6b; }
                    .debug { background: #000; padding: 1rem; border: 1px solid #555; overflow-x: auto; }
                    a { color: #4dabf7; text-decoration: none; font-size: 1.2rem; }
                </style>
            </head>
            <body>
                <h1>SSR: index.html Not Found</h1>
                <p>could not find index.html in confirmed paths.</p>
                
                <a href="/">Go to Home (Client Side)</a>
                <br><br>

                <div class="debug">
<strong>Base URL:</strong> ${baseUrl}
<strong>Current Dir:</strong> ${process.cwd()}

<strong>File System Listing:</strong>
(File system listing removed for production)
                </div>
            </body>
            </html>
        `;

        if (!html) {
            console.error("[SSR] Critical: No HTML template found on disk.");
            return response.send(errorPage);
        }

        // 2. Env Check & Init
        const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.warn("[SSR] Supabase Env Vars missing, falling back to CSR");
            return response.send(html);
        }

        if (!supabase) {
            supabase = createClient(url, key);
        }

        // 3. Fetch Article Data
        const { data, error } = await supabase
            .from('articles')
            .select('title, subdeck, featured_image_url')
            .eq('slug', slug)
            .single();

        const article: any = data;

        if (error || !article) {
            if (error) console.warn("[SSR] Supabase Fetch Error:", error.message);
            return response.send(html);
        }

        // 4. Prepare Metadata
        const isLive = Array.isArray(request.query.slug) ? request.query.slug[0].startsWith('live/') : (typeof request.query.slug === 'string' && request.query.slug.startsWith('live/'));
        const prefix = isLive ? 'لائيو: ' : '';
        const title = prefix + (article.title ? article.title.replace(/"/g, '&quot;') : 'Tazaad - Sindhi');
        const description = (article.subdeck ? article.subdeck.replace(/"/g, '&quot;') : 'Leading Sindhi digital media platform.').substring(0, 200);

        let imageUrl = article.featured_image_url;
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        const image = imageUrl || `${baseUrl}/default-og.jpg`;
        const articleUrl = `${baseUrl}/article/${slug}`;

        // 5. Inject Metadata

        // Remove existing standard meta tags - Aggressive Regex that handles attribute order and minification
        // Matches <meta ... property="og:..." ... > or <meta ... name="description" ... >
        html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["'](?:description|og:|twitter:)[^>]*?>/gi, '');

        const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
`;

        html = html.replace('<head>', `<head>${metaTags}`);
        const debugInfo = `<!-- SSR DEBUG: Disk Mode. Slug=${slug}, Live=${isLive}, Found=${!!article} -->`;
        html = html.replace('</body>', `${debugInfo}</body>`);

        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');

        return response.send(html);

    } catch (err: any) {
        console.error("[SSR] Crash:", err);
        // Fallback to pure HTML if possible
        if (html) return response.send(html);
        return response.status(500).send('Error loading page');
    }
}
