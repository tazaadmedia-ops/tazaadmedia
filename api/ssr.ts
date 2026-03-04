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
        // Robust parameter extraction
        let { type, slug } = request.query;
        if (!type || type === 'home') type = 'home';
        if (Array.isArray(type)) type = type[0];
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
        const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fppdszejziizibjlgpag.supabase.co';
        const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcGRzemVqemlpemliamxncGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDg0NTksImV4cCI6MjA4NDcyNDQ1OX0.O_xMpyfCJpjX2sjDZk0rs_x2youjwOVlobNdDL2Ulao';
        const hasEnv = !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);

        if (url && key) {
            if (!supabase) supabase = createClient(url, key);
        }

        // 3. Default Metadata (Home)
        let meta: Metadata = {
            title: "تضاد - سنڌي",
            description: "تازيون خبرون، تجزيا ۽ رپورٽون - تضاد سنڌي",
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
        if (supabase && slug) {
            if (type === 'article' || type === 'live') {
                const isLive = type === 'live';
                const { data: artResult, error: artError } = await supabase.from('articles').select('*').eq('slug', slug).single();

                if (artError) {
                    meta.title = `تضاد (DB Error: ${artError.message})`;
                }

                const art = artResult as any;
                if (art) {
                    const prefixedTitle = (isLive ? 'لائيو: ' : '') + art.title;
                    meta.title = prefixedTitle;
                    meta.description = art.subdeck || meta.description;
                    meta.url = `${baseUrl}/${type === 'live' ? 'article/live' : 'article'}/${slug}`;
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
                const { data: catResult } = await supabase.from('categories').select('*').eq('slug', slug).single();
                const cat = catResult as any;
                if (cat) {
                    meta.title = `${cat.name} | تضاد`;
                    meta.description = `تازيون خبرون ۽ مضمون ڪيٽيگري: ${cat.name}`;
                    meta.url = `${baseUrl}/category/${slug}`;
                    meta.schema = {
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": cat.name,
                        "url": meta.url
                    };
                }
            } else if (type === 'author') {
                const { data: userResult } = await supabase.from('users').select('*').eq('username', slug).single();
                const user = userResult as any;
                if (user) {
                    meta.title = `${user.full_name} | ليکڪ`;
                    meta.description = user.bio || `${user.full_name} جون لکڻيون تضاد تي.`;
                    meta.url = `${baseUrl}/author/${slug}`;
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
        }

        // 5. Inject Content
        // Aggressively remove existing metadata to avoid conflicts
        html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["'](?:description|og:|twitter:)[^>]*?>/gi, '');
        html = html.replace(/<link[^>]*?rel=["']canonical["'][^>]*?>/gi, '');

        const metaTags = `
    <title>${meta.title.replace(/"/g, '&quot;')}</title>
    <meta name="description" content="${meta.description.replace(/"/g, '&quot;')}" />
    <meta property="og:title" content="${meta.title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${meta.description.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${meta.url}" />
    <meta property="og:type" content="${meta.type}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${meta.description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${meta.image}" />
    <link rel="canonical" href="${meta.url}" />
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
