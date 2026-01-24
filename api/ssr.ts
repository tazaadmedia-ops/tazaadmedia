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
            slug = slug.split('/')[0].split('?')[0].trim();
        }

        // 1. Fetch index.html using FILE SYSTEM (More reliable than fetch)
        try {
            // Try standard locations for Vercel/Node
            const possiblePaths = [
                path.join(process.cwd(), 'index.html'),
                path.join(process.cwd(), 'public', 'index.html'), // Local dev often here
                path.join(process.cwd(), 'dist', 'index.html'),   // Vite build output
                path.join(__dirname, 'index.html'),
                path.join(__dirname, '../index.html')
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    html = fs.readFileSync(p, 'utf-8');
                    // console.log(`[SSR] Loaded index.html from ${p}`);
                    break;
                }
            }

            // Fallback to fetch if file not found locally (should rarely happen in prod if built correctly)
            if (!html) {
                console.warn('[SSR] index.html not found on disk, falling back to fetch');
                const resHtml = await fetch(`${baseUrl}/index.html`);
                if (resHtml.ok) html = await resHtml.text();
            }

        } catch (e: any) {
            console.error(`[SSR] Exception loading index.html:`, e.message);
        }

        const errorPage = `
            <!DOCTYPE html>
            <html lang="sd" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Tazaad Media</title>
                <style>
                    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9f9f9; color: #333; }
                    h1 { margin-bottom: 1rem; }
                    a { padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>معاف ڪجو، ڪا فني خرابي پيش آئي آهي.</h1>
                <p>Sorry, we encountered a technical issue loading this article.</p>
                <a href="/">Go to Home / هوم تي وڃو</a>
            </body>
            </html>
        `;

        if (!html) {
            console.error("[SSR] Critical: No HTML template found on disk or via fetch.");
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
        const title = (article.title ? article.title.replace(/"/g, '&quot;') : 'Tazaad - Sindhi');
        const description = (article.subdeck ? article.subdeck.replace(/"/g, '&quot;') : 'Leading Sindhi digital media platform.').substring(0, 200);

        let imageUrl = article.featured_image_url;
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        const image = imageUrl || `${baseUrl}/default-og.jpg`;
        const articleUrl = `${baseUrl}/article/${slug}`;

        // 5. Inject Metadata
        html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
        html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/gi, '');
        html = html.replace(/<meta\s+property=["']og:.*?["']\s+content=["'][\s\S]*?["']\s*\/?>/gi, '');
        html = html.replace(/<meta\s+name=["']twitter:.*?["']\s+content=["'][\s\S]*?["']\s*\/?>/gi, '');

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
        const debugInfo = `<!-- SSR DEBUG: Disk Mode. Slug=${slug}, Found=${!!article} -->`;
        html = html.replace('</body>', `${debugInfo}</body>`);

        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');

        return response.send(html);

    } catch (err: any) {
        console.error("[SSR] Crash:", err);
        if (html) return response.send(html);

        const errorHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><title>Error</title></head>
            <body>
                <h1>Application Error</h1>
                <p>SSR Error: ${err.message}</p>
                <a href="/">Go Home</a>
            </body>
            </html>
        `;
        return response.send(errorHtml);
    }
}
