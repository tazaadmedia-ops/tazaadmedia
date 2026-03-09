import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    const baseUrl = 'https://tazaadmedia.com';

    // Supabase Setup (using same logic as ssr.ts)
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fppdszejziizibjlgpag.supabase.co';
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcGRzemVqemlpemliamxncGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDg0NTksImV4cCI6MjA4NDcyNDQ1OX0.O_xMpyfCJpjX2sjDZk0rs_x2youjwOVlobNdDL2Ulao';

    if (!supabase && url && key) {
        supabase = createClient(url, key);
    }

    if (!supabase) {
        return response.status(500).send('Database connection failed');
    }

    try {
        // Fetch All Data for Sitemap
        const [
            { data: articles },
            { data: categories },
            { data: authors }
        ] = await Promise.all([
            supabase.from('articles').select('slug, updated_at, type').eq('status', 'published').order('updated_at', { ascending: false }),
            supabase.from('categories').select('slug'),
            supabase.from('users').select('username')
        ]);

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Static Pages -->
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>hourly</changefreq>
        <priority>1.0</priority>
    </url>
    
    <!-- Articles -->
    ${(articles || []).map((art: any) => `
    <url>
        <loc>${baseUrl}/${art.type === 'live' ? 'live/' : ''}${art.slug}</loc>
        <lastmod>${new Date(art.updated_at).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}

    <!-- Categories -->
    ${(categories || []).map((cat: any) => `
    <url>
        <loc>${baseUrl}/topic/${cat.slug}</loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
    </url>`).join('')}

    <!-- Authors -->
    ${(authors || []).map((auth: any) => `
    <url>
        <loc>${baseUrl}/author/${auth.username}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.4</priority>
    </url>`).join('')}
</urlset>`;

        response.setHeader('Content-Type', 'application/xml; charset=utf-8');
        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        return response.send(sitemap.trim());

    } catch (err: any) {
        console.error("[Sitemap] error:", err);
        return response.status(500).send('Internal Server Error');
    }
}
