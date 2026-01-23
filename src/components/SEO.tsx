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
    const siteUrl = 'https://open-editorial.vercel.app'; // Update this when deployed
    const fullUrl = `${siteUrl}${slug ? (slug.startsWith('/') ? slug : `/${slug}`) : ''}`;
    const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/default-og.jpg`;

    const baseTitle = "Tazaad - Sindhi";
    const fullTitle = title === baseTitle ? title : `${title} | ${baseTitle}`;

    // Base Schema
    const baseSchema = {
        "@context": "https://schema.org",
        "@type": schemaType || (type === 'article' ? 'NewsArticle' : 'WebSite'),
        "headline": title,
        "image": [fullImage],
        "datePublished": publishedAt,
        "dateModified": publishedAt, // Ideally separate
        "author": [{
            "@type": "Person",
            "name": author || "Open Editorial Staff",
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
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={baseTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
