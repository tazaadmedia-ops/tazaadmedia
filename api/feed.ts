import { createClient } from '@supabase/supabase-js';

// Lazy init to avoid cold start crashes
let supabase: ReturnType<typeof createClient> | null = null;

export default async function handler(request: any, response: any) {
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers['x-forwarded-host'] || request.headers.host || 'thetazaad.com';
    const baseUrl = `${protocol}://${host}`;

    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fppdszejziizibjlgpag.supabase.co';
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcGRzemVqemlpemliamxncGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDg0NTksImV4cCI6MjA4NDcyNDQ1OX0.O_xMpyfCJpjX2sjDZk0rs_x2youjwOVlobNdDL2Ulao';

    if (!supabase && url && key) {
        supabase = createClient(url, key);
    }

    if (!supabase) {
        return response.status(500).send('Database connection error');
    }

    try {
        // Fetch last 50 articles
        const { data: articlesData, error } = await supabase
            .from('articles')
            .select('title, subdeck, slug, featured_image_url, published_at, created_at')
            .order('published_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        const articles = (articlesData || []) as any[];

        const escapeXml = (unsafe: string) => (unsafe || '')
            .replace(/[<>&"']/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '"': return '&quot;';
                    case "'": return '&apos;';
                    default: return c;
                }
            });

        const rssItems = articles.map(art => {
            const artUrl = `${baseUrl}/${art.slug}`;
            const pubDate = new Date(art.published_at || art.created_at).toUTCString();
            const imageUrl = art.featured_image_url?.startsWith('http')
                ? art.featured_image_url
                : `${baseUrl}${art.featured_image_url?.startsWith('/') ? '' : '/'}${art.featured_image_url}`;

            return `
        <item>
            <title>${escapeXml(art.title)}</title>
            <link>${escapeXml(artUrl)}</link>
            <guid isPermaLink="true">${escapeXml(artUrl)}</guid>
            <pubDate>${pubDate}</pubDate>
            <description>${escapeXml(art.subdeck || art.title)}</description>
            ${art.featured_image_url ? `
            <media:content url="${escapeXml(imageUrl)}" medium="image" width="1200" height="675" />
            <enclosure url="${escapeXml(imageUrl)}" length="0" type="image/jpeg" />` : ''}
        </item>`;
        }).join('');

        const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" 
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:media="http://search.yahoo.com/mrss/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>تضاد - سنڌي</title>
    <link>${baseUrl}</link>
    <description>تضاد سنڌي - تازيون خبرون، تجزيا ۽ رپورٽون</description>
    <language>sd</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
        <url>${baseUrl}/logo.png</url>
        <title>تضاد - سنڌي</title>
        <link>${baseUrl}</link>
    </image>
    ${rssItems}
</channel>
</rss>`;

        response.setHeader('Content-Type', 'application/xml; charset=utf-8');
        response.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
        return response.send(rssFeed);

    } catch (err: any) {
        console.error("[RSS] Error:", err);
        return response.status(500).send('Internal Server Error');
    }
}
