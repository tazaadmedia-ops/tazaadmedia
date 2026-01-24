import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    let html = '';
    // Determine Base URL Robustly
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;

    // Prefer Vercel URL in production to ensure we can fetch index.html from ourselves
    // But if running locally (host includes localhost), use host.
    const isLocal = host.includes('localhost');
    const baseUrl = isLocal ? `${protocol}://${host}` : (vercelUrl || `${protocol}://${host}`);

    try {
        let { slug } = request.query;

        // Handle potential array of slugs or malformed queries
        if (!slug) return response.status(400).send('Missing slug');
        if (Array.isArray(slug)) slug = slug[0];

        // Clean slug
        if (typeof slug === 'string') {
            slug = slug.split('/')[0].split('?')[0].trim();
        }

        // 1. Fetch the raw index.html FIRST (Graceful Fallback)
        try {
            const resHtml = await fetch(`${baseUrl}/index.html`);
            if (resHtml.ok) {
                html = await resHtml.text();
            } else {
                console.warn(`[SSR] Failed to fetch index.html from ${baseUrl}, status: ${resHtml.status}`);
            }
        } catch (e) {
            console.error(`[SSR] Exception fetching index.html from ${baseUrl}`, e);
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

        // If we failed to get HTML, we MUST return something visible, not just "Loading..."
        if (!html) {
            console.error("[SSR] Critical: No HTML template found.");
            // Try to render the error page
            return response.send(errorPage);
        }

        // 2. Env Check & Init
        const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.warn("[SSR] Supabase Env Vars missing, falling back to CSR");
            return response.send(html); // Return shell for CSR
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
            // If article not found or db error, return original HTML so client-side can handle 404 or retry
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

        // Remove existing standard meta tags
        html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
        html = html.replace(/<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/gi, '');
        html = html.replace(/<meta\s+property=["']og:.*?["']\s+content=["'][\s\S]*?["']\s*\/?>/gi, '');
        html = html.replace(/<meta\s+name=["']twitter:.*?["']\s+content=["'][\s\S]*?["']\s*\/?>/gi, '');

        // New Metadata Block
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

        // Add Debug Info
        const debugInfo = `<!-- SSR DEBUG: Slug=${slug}, Found=${!!article}, Title=${title.substring(0, 20)}... -->`;
        html = html.replace('</body>', `${debugInfo}</body>`);

        // Cache for 60 seconds
        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');

        return response.send(html);

    } catch (err: any) {
        console.error("[SSR] Crash:", err);
        // Fallback to error page instead of broken HTML
        // If we have HTML, we can try to send it (CSR fallback)
        if (html) return response.send(html);

        const errorHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><title>Error</title></head>
            <body>
                <h1>Application Error</h1>
                <p>${err.message}</p>
                <a href="/">Go Home</a>
            </body>
            </html>
        `;
        return response.send(errorHtml);
    }
}
