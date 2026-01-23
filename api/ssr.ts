import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    let html = '';
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const baseUrl = `${protocol}://${host}`;

    try {
        let { slug } = request.query;
        if (!slug) return response.status(400).send('Missing slug');

        // Clean slug
        if (typeof slug === 'string') {
            slug = slug.split('/')[0].split('?')[0].trim();
        }

        // 1. Fetch the raw index.html FIRST (Graceful Fallback)
        try {
            const resHtml = await fetch(`${baseUrl}/index.html`);
            if (resHtml.ok) html = await resHtml.text();
        } catch (e) {
            console.error("Failed to fetch index.html", e);
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
        html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

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
        return response.send(html || `Error: ${err.message}`);
    }
}


