import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

interface Metadata {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    schema?: any;
}

export default async function handler(request: any, response: any) {
    let html = '';
    const start = Date.now();

    // Determine Base URL Robustly
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const isLocal = host.includes('localhost');
    const baseUrl = isLocal ? `${protocol}://${host}` : `https://thetazaad.com`;

    try {
        let { slug } = request.query;
        if (!slug) slug = 'home';
        if (Array.isArray(slug)) slug = slug[0];

        // 1. Fetch index.html using FILE SYSTEM
        try {
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

        if (!html) return response.status(500).send('System Error: Template Missing');

        // 2. Env Check & Init
        const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (!url || !key) return response.send(html);
        if (!supabase) supabase = createClient(url, key);

        // 3. Default Metadata (Home)
        let meta: Metadata = {
            title: "تضاد - سنڌي (Tazaad - Sindhi)",
            description: "Leading Sindhi digital media platform offering news, analysis, and special reports.",
            image: `${baseUrl}/default-og.jpg`,
            url: baseUrl,
            type: "website",
            schema: {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Tazaad",
                "url": baseUrl
            }
        };

        // 4. Route Handling
        const [type, ...parts] = slug.split('/');
        const detail = parts.join('/');

        if (type === 'article' || type === 'live') {
            const isLive = type === 'live';
            const { data: art } = await supabase.from('articles').select('*').eq('slug', detail).single();
            if (art) {
                const prefixedTitle = (isLive ? 'لائيو: ' : '') + art.title;
                meta.title = `${prefixedTitle} | تضاد`;
                meta.description = art.subdeck || meta.description;
                meta.url = `${baseUrl}/${type}/${detail}`;
                meta.type = "article";
                if (art.featured_image_url) {
                    meta.image = art.featured_image_url.startsWith('http') ? art.featured_image_url : `${baseUrl}${art.featured_image_url.startsWith('/') ? '' : '/'}${art.featured_image_url}`;
                }
                meta.schema = {
                    "@context": "https://schema.org",
                    "@type": isLive ? "LiveBlogPosting" : "NewsArticle",
                    "headline": art.title,
                    "image": [meta.image],
                    "datePublished": art.published_at || art.created_at,
                    "dateModified": art.updated_at || art.published_at,
                    "author": { "@type": "Person", "name": "Tazaad Staff" }
                };
            }
        } else if (type === 'category') {
            const { data: cat } = await supabase.from('categories').select('*').eq('slug', detail).single();
            if (cat) {
                meta.title = `${cat.name} | تضاد`;
                meta.description = `تازيون خبرون ۽ مضمون ڪيٽيگري: ${cat.name}`;
                meta.url = `${baseUrl}/category/${detail}`;
                meta.schema = {
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": cat.name,
                    "url": meta.url
                };
            }
        } else if (type === 'author') {
            const { data: user } = await supabase.from('users').select('*').eq('username', detail).single();
            if (user) {
                meta.title = `${user.full_name} | ليکڪ`;
                meta.description = user.bio || `${user.full_name} جون لکڻيون تضاد تي.`;
                meta.url = `${baseUrl}/author/${detail}`;
                if (user.avatar_url) {
                    meta.image = user.avatar_url.startsWith('http') ? user.avatar_url : `${baseUrl}${user.avatar_url.startsWith('/') ? '' : '/'}${user.avatar_url}`;
                }
                meta.schema = {
                    "@context": "https://schema.org",
                    "@type": "ProfilePage",
                    "name": user.full_name,
                    "url": meta.url
                };
            }
        }

        // 5. Inject Content
        html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["'](?:description|og:|twitter:)[^>]*?>/gi, '');

        const metaTags = `
    <title>${meta.title.replace(/"/g, '&quot;')}</title>
    <meta name="description" content="${meta.description.replace(/"/g, '&quot;')}" />
    <meta property="og:title" content="${meta.title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${meta.description.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:url" content="${meta.url}" />
    <meta property="og:type" content="${meta.type}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${meta.description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${meta.image}" />
    <script type="application/ld+json">${JSON.stringify(meta.schema)}</script>
`;

        html = html.replace('<head>', `<head>${metaTags}`);

        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        return response.send(html);

    } catch (err: any) {
        console.error("[SSR] Crash:", err);
        return response.send(html);
    }
}
