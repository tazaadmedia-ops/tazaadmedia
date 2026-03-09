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
    const host = request.headers['x-forwarded-host'] || request.headers.host || 'thetazaad.com';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const baseUrl = `${protocol}://${host}`;

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

        const fbAppId = process.env.VITE_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID || '';

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
                "name": "تضاد",
                "url": baseUrl,
                "inLanguage": "sd"
            }
        };

        // 4. Route Handling
        if (supabase && slug) {
            // Helper for query timeout
            const withTimeout = (promise: Promise<any>, timeoutMs: number) =>
                Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs))
                ]);

            if (type === 'article' || type === 'live') {
                const isLive = type === 'live';
                try {
                    // OPTIMIZED: Only select columns needed for SEO/Meta
                    const query = supabase
                        .from('articles')
                        .select('title, subdeck, slug, featured_image_url, published_at, created_at, updated_at')
                        .eq('slug', slug)
                        .single();

                    const { data: artResult, error: artError } = await withTimeout(Promise.resolve(query), 8000) as any;

                    if (artResult && !artError) {
                        const art = artResult;
                        const prefixedTitle = (isLive ? 'لائيو: ' : '') + art.title;
                        meta.title = prefixedTitle;
                        meta.description = art.subdeck || meta.description;
                        meta.url = `${baseUrl}/${isLive ? 'live/' : ''}${slug}`;
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
                            "author": { "@type": "Person", "name": "تضاد اسٽاف" },
                            "publisher": {
                                "@type": "Organization",
                                "name": "تضاد",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": `${baseUrl}/default-og.jpg`
                                }
                            },
                            "inLanguage": "sd"
                        };
                    }
                } catch (e) {
                    console.error(`[SSR] Article Fetch Failed/Timed out:`, e);
                }
            } else if (type === 'category') {
                try {
                    const query = supabase.from('categories').select('name, slug').eq('slug', slug).single();
                    const { data: catResult } = await withTimeout(Promise.resolve(query), 5000) as any;
                    if (catResult) {
                        const cat = catResult;
                        meta.title = `${cat.name} | تضاد`;
                        meta.description = `تازيون خبرون ۽ مضمون ڪيٽيگري: ${cat.name}`;
                        meta.url = `${baseUrl}/topic/${slug}`;
                        meta.schema = {
                            "@context": "https://schema.org",
                            "@type": "CollectionPage",
                            "name": cat.name,
                            "url": meta.url,
                            "inLanguage": "sd"
                        };
                    }
                } catch (e) { console.error(`[SSR] Category Fetch Failed:`, e); }
            } else if (type === 'author') {
                try {
                    const query = supabase.from('users').select('full_name, username, bio, avatar_url').eq('username', slug).single();
                    const { data: userResult } = await withTimeout(Promise.resolve(query), 5000) as any;
                    if (userResult) {
                        const user = userResult;
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
                            "url": meta.url,
                            "agent": {
                                "@type": "Person",
                                "name": user.full_name
                            },
                            "inLanguage": "sd"
                        };
                    }
                } catch (e) { console.error(`[SSR] Author Fetch Failed:`, e); }
            }
        }

        // 5. Inject Content
        // Aggressively remove existing metadata to avoid conflicts
        html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
        // Match all meta tags that we are about to re-inject, including those with different casing or attribute order
        html = html.replace(/<meta[^>]*?(?:name|property|itemprop)=["'](?:description|og:|twitter:|image)[^>]*?>/gi, '');
        html = html.replace(/<link[^>]*?rel=["'](?:canonical|image_src)["'][^>]*?>/gi, '');

        // WhatsApp/OG Requirement
        if (!html.includes('prefix=')) {
            html = html.replace('<html', '<html prefix="og: http://ogp.me/ns#"');
        }

        const escapeAttr = (str: string) => str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const escapeUrl = (str: string) => str.replace(/"/g, '&quot;');

        const optimizeImage = (url: string) => {
            if (url.includes('supabase.co') && !url.includes('?')) {
                return `${url}?width=800&quality=80`;
            }
            return url;
        };

        const getMimeType = (url: string) => {
            const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
            if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
            if (ext === 'png') return 'image/png';
            if (ext === 'webp') return 'image/webp';
            return 'image/jpeg';
        };

        const finalImage = optimizeImage(meta.image);
        const mimeType = getMimeType(finalImage);

        // Truncate description for better social display
        const truncatedDesc = meta.description.length > 165
            ? meta.description.substring(0, 160) + '...'
            : meta.description;

        const metaTags = `
    <title>${escapeAttr(meta.title)}</title>
    <meta name="description" content="${escapeAttr(truncatedDesc)}" />
    <meta property="og:image" content="${escapeUrl(finalImage)}" />
    <meta property="og:image:secure_url" content="${escapeUrl(finalImage)}" />
    <meta property="og:image:type" content="${mimeType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeAttr(meta.title)}" />
    <meta property="og:title" content="${escapeAttr(meta.title)}" />
    <meta property="og:description" content="${escapeAttr(truncatedDesc)}" />
    <meta property="og:url" content="${escapeUrl(meta.url)}" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:site_name" content="تضاد - سنڌي" />
    <meta itemprop="image" content="${escapeUrl(finalImage)}" />
    <link rel="image_src" href="${escapeUrl(finalImage)}" />
    ${fbAppId ? `<meta property="fb:app_id" content="${escapeAttr(fbAppId)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@thetazaad" />
    <meta name="twitter:creator" content="@thetazaad" />
    <meta name="twitter:title" content="${escapeAttr(meta.title)}" />
    <meta name="twitter:description" content="${escapeAttr(truncatedDesc)}" />
    <meta name="twitter:image" content="${escapeUrl(finalImage)}" />
    <meta name="twitter:image:src" content="${escapeUrl(finalImage)}" />
    <meta name="twitter:url" content="${escapeUrl(meta.url)}" />
    <meta name="twitter:domain" content="${host}" />
    <link rel="canonical" href="${escapeUrl(meta.url)}" />
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
