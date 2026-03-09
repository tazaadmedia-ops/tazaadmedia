import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host || 'thetazaad.com';
    const baseUrl = `${protocol}://${host}`;

    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabase && url && key) {
        supabase = createClient(url, key);
    }

    const { slug } = request.query;

    if (!supabase || !slug) {
        return response.status(404).send('Not Found');
    }

    try {
        const { data: artData, error } = await supabase
            .from('articles')
            .select('*, categories(name)')
            .eq('slug', slug)
            .single();

        if (error || !artData) {
            return response.status(404).send('Article Not Found');
        }

        const art = artData as any;

        const escapeHtml = (unsafe: string) => (unsafe || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        const title = `${art.title} - تضاد`;
        const description = art.subdeck || art.title;
        const imageUrl = art.featured_image_url?.startsWith('http')
            ? art.featured_image_url
            : `${baseUrl}${art.featured_image_url?.startsWith('/') ? '' : '/'}${art.featured_image_url}`;

        // Mandatory AMP HTML structure
        const ampContent = `<!doctype html>
<html ⚡ lang="sd" dir="rtl">
<head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${baseUrl}/${art.slug}">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <style amp-custom>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111; padding: 0; margin: 0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #ed1c24; margin-bottom: 20px; padding-bottom: 10px; }
        .logo { font-size: 24px; font-weight: 800; color: #ed1c24; text-decoration: none; }
        .category { color: #ed1c24; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
        h1 { font-size: 32px; line-height: 1.2; margin: 10px 0; }
        .subdeck { color: #666; font-size: 18px; margin-bottom: 20px; }
        .meta { color: #888; font-size: 14px; margin-bottom: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        .content { font-size: 18px; }
        footer { margin-top: 40px; padding: 20px; background: #f8f9fa; text-align: center; font-size: 14px; color: #666; }
        amp-img { background-color: #f0f0f0; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <a href="${baseUrl}" class="logo">تضاد</a>
        </header>

        <article>
            <div class="category">${escapeHtml(art.categories?.name || 'خبرون')}</div>
            <h1>${escapeHtml(art.title)}</h1>
            <p class="subdeck">${escapeHtml(art.subdeck || '')}</p>

            <div class="meta">
                شايع ٿيل: ${new Date(art.published_at || art.created_at).toLocaleDateString('sd-PK')}
            </div>

            ${art.featured_image_url ? `
            <amp-img src="${escapeHtml(imageUrl)}" 
                width="800" height="450" 
                layout="responsive" 
                alt="${escapeHtml(art.title)}"></amp-img>
            ` : ''}

            <div class="content">
                ${art.content_text || ''}
            </div>
        </article>

        <footer>
            &copy; ${new Date().getFullYear()} Tazaad Media - سڀ حق محفوظ آهن
        </footer>
    </div>
</body>
</html>`;

        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
        return response.send(ampContent);

    } catch (err: any) {
        console.error("[AMP] Error:", err);
        return response.status(500).send('Internal Server Error');
    }
}
