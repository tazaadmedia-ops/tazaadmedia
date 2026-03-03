import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    slug?: string;
    type?: 'website' | 'article';
    publishedAt?: string;
    author?: string;
    schemaType?: 'NewsArticle' | 'Article' | 'WebSite' | 'CollectionPage' | 'ProfilePage';
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
    schemaType,
    jsonLd
}) => {
    const siteUrl = 'https://tazaad.com.pk'; // Final production domain
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

    const baseTitle = "Tazaad - Sindhi";
    const fullTitle = title === baseTitle ? title : `${title} | ${baseTitle}`;

    // Base Schema
    const baseSchema = {
        "@context": "https://schema.org",
        "@type": schemaType || (type === 'article' ? 'NewsArticle' : 'WebSite'),
        "headline": title.replace('لائيو: ', ''),
        "image": [fullImage],
        "datePublished": publishedAt,
        "dateModified": publishedAt,
        "author": [{
            "@type": "Person",
            "name": author || "Tazaad Staff",
            "url": siteUrl
        }]
    };

    // Merge custom JSON-LD if provided
    const structuredData = jsonLd ? { ...baseSchema, ...jsonLd } : baseSchema;

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:image:secure_url" content={fullImage} />
            <meta property="og:site_name" content={baseTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />
            <meta name="twitter:site" content="@tazaadmedia" />

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
