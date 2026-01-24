import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    let html = '';
    // Determine Base URL Robustly
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
    const baseUrl = vercelUrl || `${protocol}://${host}`;

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
            // In Vercel environment, we might need to fetch from the deployment URL
            const validBaseUrl = baseUrl.includes('localhost') ? baseUrl : (vercelUrl || baseUrl);
            const resHtml = await fetch(`${validBaseUrl}/index.html`);
            if (resHtml.ok) {
                html = await resHtml.text();
            } else {
                console.warn(`Failed to fetch index.html from ${validBaseUrl}, status: ${resHtml.status}`);
            }
        } catch (e) {
            console.error("Failed to fetch index.html", e);
        }

        // If we failed to get HTML, we can't do server-side injection properly, but we should try to recover or fail gracefully.
        // For now, let's proceed; if html is empty, we might just return a basic string or error.
        if (!html && !process.env.VITE_SUPABASE_URL) {
            return response.send('Error loading application.');
        }

        // 2. Env Check & Init
        const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.warn("Supabase Env Vars missing, falling back to CSR");
            return response.send(html || 'Loading...'); // Fallback to CSR
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
            if (error) console.warn("Supabase Fetch Error:", error);
            // If article not found, return original HTML so client-side routing can handle 404
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

        // 5. Inject Metadata - CRITICAL: Strip existing tags first to avoid duplicates

        // Remove existing standard meta tags
        html = html.replace(/<title>.*?<\/title>/i, '');
        html = html.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/gi, '');
        html = html.replace(/<meta\s+property=["']og:.*?["']\s+content=["'].*?["']\s*\/?>/gi, '');
        html = html.replace(/<meta\s+name=["']twitter:.*?["']\s+content=["'].*?["']\s*\/?>/gi, '');

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

        // Cache for 60 seconds
        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');

        return response.send(html);

    } catch (err: any) {
        console.error("SSR Crash:", err);
        // Fallback to pure HTML if something goes wrong, so the client app still loads
        return response.send(html || `Error: ${err.message}`);
    }
}


