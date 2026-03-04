import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    let html = '';
    const start = Date.now();

    // Determine Base URL Robustly
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host;
    const isLocal = host.includes('localhost');
    const baseUrl = isLocal ? `${protocol}://${host}` : `https://thetazaad.com`; // Hardcode production for safety in SSR context

    try {
        let { slug } = request.query;

        if (!slug) return response.status(400).send('Missing slug');
        if (Array.isArray(slug)) slug = slug[0];

        // Clean slug
        slug = slug.split('?')[0].trim();
        const isLiveRequest = slug.startsWith('live/');
        const cleanSlug = isLiveRequest ? slug.replace('live/', '') : slug.split('/')[0];

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

        if (!html) {
            console.error("[SSR] Critical: No HTML template found on disk.");
            return response.status(500).send('System Error: Template Missing');
        }

        // 2. Env Check & Init
        const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.warn("[SSR] Supabase Env Vars missing");
            return response.send(html);
        }

        if (!supabase) {
            supabase = createClient(url, key);
        }

        // 3. Fetch Article Data
        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', cleanSlug)
            .single();

        if (error || !article) {
            console.warn(`[SSR] Article not found: ${cleanSlug}`, error?.message);
            return response.send(html);
        }

        const art = article as any;

        // 4. Prepare Metadata
        const prefix = isLiveRequest ? 'لائيو: ' : '';
        const title = (prefix + (art.title || 'Tazaad - Sindhi')).replace(/"/g, '&quot;');
        const description = (art.subdeck || 'Leading Sindhi digital media platform.').replace(/"/g, '&quot;').substring(0, 200);

        let imageUrl = art.featured_image_url;
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        }
        const image = imageUrl || `${baseUrl}/default-og.jpg`;
        const articleUrl = `${baseUrl}/article/${slug}`;

        // 5. Inject Metadata

        // Remove existing title and common meta tags that industrial scrapers might latch onto
        html = html.replace(/<title>[\s\S]*?<\/title>/i, '');
        html = html.replace(/<meta[^>]*?(?:name|property)=["'](?:description|og:|twitter:)[^>]*?>/gi, '');

        const metaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:type" content="article" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:site" content="@tazaadmedia" />
`;

        // 5a. Generate JSON-LD (Schema.org)
        const schema = {
            "@context": "https://schema.org",
            "@type": isLiveRequest ? "LiveBlogPosting" : "NewsArticle",
            "headline": title.replace('لائيو: ', ''),
            "description": description,
            "image": [image],
            "datePublished": art.published_at || art.created_at,
            "dateModified": art.updated_at || art.published_at || art.created_at,
            "author": {
                "@type": "Person",
                "name": "Tazaad Staff",
                "url": baseUrl
            },
            "publisher": {
                "@type": "Organization",
                "name": "Tazaad",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${baseUrl}/logo.png`
                }
            }
        };

        const jsonLd = `
    <script type="application/ld+json">
        ${JSON.stringify(schema)}
    </script>
`;

        const debugComment = `<!-- 
            SSR DEBUG REPORT:
            Timestamp: ${new Date().toISOString()}
            Process Time: ${Date.now() - start}ms
            Slug Requested: ${slug}
            Slug Cleaned: ${cleanSlug}
            Article Found: ${!!article}
            Live Mode Detect: ${isLiveRequest}
            Base URL: ${baseUrl}
            Env URL Present: ${!!process.env.VITE_SUPABASE_URL || !!process.env.SUPABASE_URL}
            Env Key Present: ${!!process.env.VITE_SUPABASE_ANON_KEY || !!process.env.SUPABASE_ANON_KEY}
        -->`;

        html = html.replace('<head>', `<head>${metaTags}${jsonLd}${debugComment}`);

        const duration = Date.now() - start;
        response.setHeader('X-SSR-Process-Time', `${duration}ms`);
        response.setHeader('X-SSR-Status', 'Success');
        response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
        response.setHeader('Content-Type', 'text/html; charset=utf-8');

        return response.send(html);

    } catch (err: any) {
        console.error("[SSR] Crash:", err);
        if (html) return response.send(html);
        return response.status(500).send('Internal Server Error');
    }
}
