import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    try {
        const { slug } = request.query;
        if (!slug) return response.status(400).send('Missing slug');

        // 1. Env Check & Init
        if (!supabase) {
            const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
            const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

            if (!url || !key) {
                console.error("Missing Supabase Env Vars");
                // Fallback to static HTML if env vars are missing, don't crash
                // But better to explain
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
            // Fetch from self (static asset)
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

        if (error) {
            console.error("Supabase Error:", error);
            // If error is not 404 (PGRST116), it might be connection.
            // But if simply not found, serve the app so client can handle 404.
        }

        if (!article) {
            return response.send(html);
        }

        // 4. Replace Metadata
        const title = article.title ? article.title.replace(/"/g, '&quot;') : 'Tazaad - Sindhi';
        const description = article.subdeck ? article.subdeck.replace(/"/g, '&quot;') : 'Leading Sindhi digital media platform.';
        const image = article.featured_image_url || `${baseUrl}/default-og.jpg`;
        const url = `${baseUrl}/article/${slug}`;

        // Basic Replacement
        html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

        // Remove existing OG tags to avoid dupes (rough regex)
        // html = html.replace(/<meta property="og:.*?>/g, '');
        // html = html.replace(/<meta name="twitter:.*?>/g, ''); 

        // Inject new tags before </head>
        const metaTags = `
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:url" content="${url}" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />
        `;

        html = html.replace('</head>', `${metaTags}</head>`);

        // Cache for 60 seconds
        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        response.setHeader('Content-Type', 'text/html');

        return response.send(html);

    } catch (err: any) {
        console.error("SSR Crash:", err);
        return response.status(500).send(`Internal Server Error: ${err.message}`);
    }
}
