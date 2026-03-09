import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    const baseUrl = 'https://thetazaad.com';

    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fppdszejziizibjlgpag.supabase.co';
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcGRzemVqemlpemliamxncGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDg0NTksImV4cCI6MjA4NDcyNDQ1OX0.O_xMpyfCJpjX2sjDZk0rs_x2youjwOVlobNdDL2Ulao';

    if (!supabase && url && key) {
        supabase = createClient(url, key);
    }

    if (!supabase) return response.status(500).send('Database connection failed');

    try {
        // Fetch published articles from the last 48 hours for Google News
        // Google News sitemap standard requires articles from the last 2 days.
        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

        const { data: articles, error } = await supabase
            .from('articles')
            .select('title, slug, published_at, created_at, is_live')
            .eq('status', 'published')
            .gte('published_at', twoDaysAgo.toISOString())
            .order('published_at', { ascending: false })
            .limit(1000);

        if (error) throw error;

        const escapeXml = (unsafe: string) => {
            return unsafe.replace(/[<>&'"]/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                    default: return c;
                }
            });
        };

        const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    ${(articles || []).map((art: any) => `
    <url>
        <loc>${baseUrl}/${art.is_live ? 'live/' : ''}${art.slug}</loc>
        <news:news>
            <news:publication>
                <news:name>Tazaad</news:name>
                <news:language>sd</news:language>
            </news:publication>
            <news:publication_date>${new Date(art.published_at || art.created_at).toISOString()}</news:publication_date>
            <news:title>${escapeXml(art.title)}</news:title>
        </news:news>
    </url>`).join('')}
</urlset>`;

        response.setHeader('Content-Type', 'application/xml; charset=utf-8');
        response.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate'); // 10 min cache
        return response.send(newsSitemap.trim());

    } catch (err: any) {
        console.error("[News Sitemap] error:", err);
        return response.status(500).send('Internal Server Error');
    }
}
