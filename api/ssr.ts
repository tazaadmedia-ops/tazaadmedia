import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    try {
        let { slug } = request.query;
        if (!slug) return response.status(400).send('Missing slug');

        // Clean slug (remove trailing slash or query params if passed through source)
        if (typeof slug === 'string') {
            slug = slug.split('/')[0].split('?')[0].trim();
        }

        // 1. Env Check & Init
        if (!supabase) {
            const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
            const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

            if (!url || !key) {
                console.error("Missing Supabase Env Vars");
                return response.status(500).send('Server Configuration Error: Missing Supabase Env Vars');
            }
            supabase = createClient(url, key);
        }

        // 2. Fetch the raw index.html
        const protocol = request.headers['x-forwarded-proto'] || 'https';
        const host = request.headers['x-forwarded-host'] || request.headers.host;
        const baseUrl = `${protocol}://${host}`;

        let html = '';
        try {
            const resHtml = await fetch(`${baseUrl}/index.html`);
            if (!resHtml.ok) throw new Error(`HTTP ${resHtml.status}`);
            html = await resHtml.text();
        } catch (e) {
            console.error("Failed to fetch index.html", e);
            return response.status(500).send(`Server Error: Failed to fetch template. ${e}`);
        }

        // 3. Fetch Article Data
        const { data, error } = await supabase
            .from('articles')
            .select('title, subdeck, featured_image_url')
            .eq('slug', slug)
            .single();

        const article: any = data;

        if (error || !article) {
            if (error) console.error("Supabase Error:", error);
            // Serve original html if article not found, so client handles 404
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
        // Replace existing title
        html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

        // Inject dynamic tags immediately after <head> for fastest discovery
        const metaTags = `
    <!-- Dynamic Social Tags -->
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
        response.setHeader('Content-Type', 'text/html');

        return response.send(html);

    } catch (err: any) {
        console.error("SSR Crash:", err);
        return response.status(500).send(`Internal Server Error: ${err.message}`);
    }
}

