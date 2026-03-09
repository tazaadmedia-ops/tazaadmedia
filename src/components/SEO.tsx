import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    slug?: string;
    type?: 'website' | 'article';
    publishedAt?: string;
    author?: string;
    articleBody?: string;
    schemaType?: 'NewsArticle' | 'Article' | 'WebSite' | 'CollectionPage' | 'ProfilePage' | 'LiveBlogPosting';
    jsonLd?: any; // Custom additional JSON-LD
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = "Leading Sindhi digital media platform offering news, analysis, and special reports.",
    image,
    slug = "",
    type = 'website',
    publishedAt,
    author,
    articleBody,
    schemaType,
    jsonLd
}) => {
    useEffect(() => {
        document.documentElement.setAttribute('prefix', 'og: http://ogp.me/ns#');
    }, []);

    const siteUrl = 'https://thetazaad.com'; // Final production domain
    const fullUrl = `${siteUrl}${slug ? (slug.startsWith('/') ? slug : `/${slug}`) : ''}`;

    // Ensure image is absolute and handles Supabase paths
    let fullImage = `${siteUrl}/default-og.jpg`;
    if (image) {
        if (image.startsWith('http')) {
            fullImage = image;
        } else {
            fullImage = `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`;
        }
    }

    const optimizedImage = fullImage.includes('supabase.co') && !fullImage.includes('?')
        ? `${fullImage}?width=800&quality=80`
        : fullImage;

    const getMimeType = (url: string) => {
        const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || 'jpeg';
        if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
        if (ext === 'png') return 'image/png';
        if (ext === 'webp') return 'image/webp';
        return 'image/jpeg';
    };
    const mimeType = getMimeType(optimizedImage);

    const baseTitle = "تضاد - سنڌي";
    const fullTitle = title === "هوم" || title === "Home" || title === baseTitle ? baseTitle : `${title} - ${baseTitle}`;

    // Base Schema
    const baseSchema: any = {
        "@context": "https://schema.org",
        "@type": schemaType || (type === 'article' ? 'NewsArticle' : 'WebSite'),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": fullUrl
        },
        "headline": title.replace('لائيو: ', ''),
        "description": description,
        "image": [fullImage],
        "datePublished": publishedAt,
        "dateModified": publishedAt,
        "inLanguage": "sd",
        "author": [{
            "@type": "Person",
            "name": author || "Tazaad Staff",
            "url": siteUrl
        }],
        "publisher": {
            "@type": "Organization",
            "name": "تضاد",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.png`
            }
        }
    };

    if (articleBody) {
        baseSchema.articleBody = articleBody;
    }

    // For LiveBlogPosting, we might want to ensure certain properties exist or are merged correctly
    // If schemaType is LiveBlogPosting, the jsonLd passed should ideally be the source of truth
    const structuredData = (schemaType === 'LiveBlogPosting' && jsonLd)
        ? { ...jsonLd, "@context": "https://schema.org" } // Ensure context is there
        : (jsonLd ? { ...baseSchema, ...jsonLd } : baseSchema);

    return (
        <Helmet>
            <html lang="sd" dir="rtl" />
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />
            <link rel="alternate" type="application/rss+xml" title="Tazaad RSS Feed" href="/feed.xml" />
            {type === 'article' && !slug.includes('live/') && (
                <link rel="amphtml" href={`${siteUrl}/amp/${slug.replace(/^\//, '')}`} />
            )}
            <link rel="preconnect" href="https://fppdszejziizibjlgpag.supabase.co" crossOrigin="" />
            <link rel="preload" href="/assets/fonts/SF-Arabic.woff2" as="font" type="font/woff2" crossOrigin="" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={optimizedImage} />
            <meta property="og:image:secure_url" content={optimizedImage} />
            <meta property="og:image:type" content={mimeType} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={fullTitle} />
            <meta property="fb:app_id" content={import.meta.env.VITE_FACEBOOK_APP_ID || ""} />
            <meta property="og:site_name" content={baseTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={optimizedImage} />
            <meta name="twitter:site" content="@thetazaad" />

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
