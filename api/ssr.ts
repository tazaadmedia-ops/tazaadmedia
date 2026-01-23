import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Admin/Service Key not needed for public reads)
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(request, response) {
    const { slug } = request.query;
    const userAgent = request.headers['user-agent'] || '';

    // 1. Fetch the raw index.html
    // We need to fetch the static index.html from the current deployment
    // Vercel_URL is available in environment
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const baseUrl = `${protocol}://${host}`;

    let html = '';
    try {
        const resHtml = await fetch(`${baseUrl}/index.html`);
        html = await resHtml.text();
    } catch (e) {
        console.error("Failed to fetch index.html", e);
        return response.status(500).send('Server Error fetching template');
    }

    // 2. Fetch Article Data
    const { data: article } = await supabase
        .from('articles')
        .select('title, subdeck, featured_image_url')
        .eq('slug', slug)
        .single();

    if (!article) {
        // If no article found, just return the static HTML (let client handle 404 UI)
        return response.send(html);
    }

    // 3. Replace Metadata
    // We use simple string replacement to minimize dependencies
    const title = article.title || 'Tazaad - Sindhi';
    const description = article.subdeck || 'Leading Sindhi digital media platform.';
    const image = article.featured_image_url || `${baseUrl}/default-og.jpg`;
    const url = `${baseUrl}/article/${slug}`;

    // Replace Title
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

    // Replace Open Graph Tags
    // We strip existing tags first to avoid duplicates, or just inject over them if they are placeholder
    // A simpler strategy: Replace specific known placeholder (if any) or head close tag.

    // Strategy: Inject strictly before </head>
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

    // Remove generic tags if present to prevent conflict (optional, but cleaner)
    // Getting regex right for multiline HTML can be tricky.
    // For now, we will append our specific dynamic tags at the END of head, which usually overrides.
    html = html.replace('</head>', `${metaTags}</head>`);

    // Set Cache Control for social bots
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    response.setHeader('Content-Type', 'text/html');

    return response.send(html);
}
