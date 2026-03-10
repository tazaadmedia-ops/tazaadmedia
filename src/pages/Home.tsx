import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SkeletonHome from '../components/SkeletonHome';
import SEO from '../components/SEO';
import SafeImage from '../components/SafeImage';

const Home: React.FC = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchArticles(), fetchSections()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchSections = async () => {
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('is_visible_on_home', true)
            .order('created_at', { ascending: true }); // Chronological order

        if (categories) {
            setSections(categories.map(c => ({
                title: c.name,
                slug: c.slug,
                id: c.id
            })));
        }
    };

    const fetchArticles = async () => {
        const { data, error } = await supabase
            .from('articles')
            .select(`
                *,
                categories ( name, slug, id ),
                article_authors (
                    users ( full_name )
                )
            `)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .order('is_pinned', { ascending: false })
            .order('is_live', { ascending: false })
            .limit(40); // Optimized for home page segments

        if (error) console.error('Error fetching home articles:', error);
        if (data) setArticles(data);
    };

    const getAuthor = (article: any) => {
        return article.article_authors?.[0]?.users?.full_name || null;
    };

    const getCategory = (article: any) => {
        return article.categories?.name || 'News';
    };

    // Filter helper
    const getArticlesForSection = (sectionId: string) => {
        return articles.filter(a => {
            return a.primary_category_id === sectionId;
        }).slice(0, 4); // Limit to 4 per section
    };

    // Routing helper
    const getArticleLink = (article: any) => {
        return article.is_live ? `/live/${article.slug}` : `/${article.slug}`;
    };

    // Live Badge Component for Homepage
    const LiveBadge = () => (
        <span style={{ color: '#dc2626', fontWeight: 800, display: 'inline-flex', alignItems: 'center' }}>
            <span className="live-dot-container">
                <span className="live-dot-ping"></span>
                <span className="live-dot-core"></span>
            </span>
            لائيو
        </span>
    );

    if (loading) return <SkeletonHome />;


    // Distribute top items for the updated layout
    const heroStory = articles[0]; // main featured
    const sideStories = articles.slice(1, 3); // 2 side vertically stacked on RTL left (visual left)
    const bottomStories = articles.slice(3, 7); // 4 full width in a row

    return (
        <div className="container" style={{ marginTop: '0', fontFamily: 'var(--font-main)' }}>
            <SEO
                title="پھريون صفعو"
                description="Open Editorial provides in-depth analysis, special reports, and latest news from Sindh and beyond."
                schemaType="WebSite"
            />

            {/* --- TOP LATEST NEWS --- */}
            <h2 className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: '0' }}>تازيون خبرون</h2>

            {/* Hero + Side Column Grid */}
            <div className="mobile-grid-1" style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(500px, 7fr) minmax(280px, 3fr)',
                gap: '2.5rem',
                marginBottom: '2.5rem'
            }}>

                {/* Center/Main Column - Hero (Visually Right in RTL) */}
                <div>
                    {heroStory ? (
                        <Link to={getArticleLink(heroStory)} style={{ display: 'block' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#eee', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {heroStory.featured_image_url ? (
                                        <SafeImage
                                            src={heroStory.featured_image_url}
                                            alt={heroStory.title}
                                            fetchPriority="high"
                                            width="1200"
                                            height="675"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{ color: '#999' }}>No Image</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: heroStory.is_live ? '#dc2626' : 'var(--color-accent)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    {heroStory.is_live ? <LiveBadge /> : `● ${getCategory(heroStory)}`}
                                </span>
                                {getAuthor(heroStory) && (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-lighter)', fontWeight: 500 }}>
                                        {getAuthor(heroStory)}
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: '2.4rem', lineHeight: 1.15, marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#1A1A1A' }}>
                                {heroStory.title}
                            </h1>
                            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-light)', lineHeight: 1.6, marginBottom: '0.5rem', fontWeight: 400 }}>
                                {heroStory.subdeck}
                            </p>
                        </Link>
                    ) : (
                        <div style={{ padding: '2rem', border: '1px dashed #ccc', textAlign: 'center' }}>No featured story yet. Publish one!</div>
                    )}
                </div>

                {/* Side Column (RTL visual left) - 2 cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {sideStories.map(story => (
                        <div key={story.id}>
                            <Link to={getArticleLink(story)} style={{ display: 'block' }}>
                                <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '0.8rem', overflow: 'hidden' }}>
                                    <SafeImage src={story.featured_image_url} alt={story.title} width="400" height="250" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ color: story.is_live ? '#dc2626' : 'var(--color-accent)', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                                    {story.is_live ? <LiveBadge /> : getCategory(story)}
                                </div>
                                <h2 style={{ fontSize: '1.1rem', lineHeight: 1.3, fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.01em', color: '#1A1A1A' }}>
                                    {story.title}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {story.subdeck}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row - 4 cards full width */}
            {bottomStories.length > 0 && (
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #E8E8E8', marginBottom: '3rem' }}>
                    {bottomStories.map(story => (
                        <div key={story.id}>
                            <Link to={getArticleLink(story)} style={{ display: 'block' }}>
                                <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '0.8rem', overflow: 'hidden' }}>
                                    <SafeImage
                                        src={story.featured_image_url}
                                        alt={story.title}
                                        width="400"
                                        height="250"
                                        loading="lazy"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div style={{ color: story.is_live ? '#dc2626' : 'var(--color-accent)', fontWeight: 800, fontSize: '0.75rem', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                                    {story.is_live ? <LiveBadge /> : getCategory(story)}
                                </div>
                                <h2 style={{ fontSize: '1.1rem', lineHeight: 1.3, fontWeight: 900, marginBottom: '0.3rem', letterSpacing: '-0.01em', color: '#1A1A1A' }}>
                                    {story.title}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {story.subdeck}
                                </p>
                            </Link>
                        </div>
                    ))}
                </div>
            )}


            {/* --- DYNAMIC SECTIONS --- */}

            {sections.map((section) => {
                const sectionArticles = getArticlesForSection(section.id);
                if (sectionArticles.length === 0) return null;

                return (
                    <div key={section.id} style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{section.title}</h2>
                            <Link
                                to={`/topic/${section.slug}`}
                                style={{ fontSize: '0.9rem', fontWeight: 600, color: '#666', textDecoration: 'none' }}
                            >
                                ڏسو سڀ →
                            </Link>
                        </div>

                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {sectionArticles.map(story => (
                                <Link key={story.id} to={getArticleLink(story)}>
                                    <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '0.8rem', overflow: 'hidden' }}>
                                        <SafeImage
                                            src={story.featured_image_url}
                                            alt={story.title}
                                            width="400"
                                            height="250"
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    {story.is_live && <div style={{ marginBottom: '0.25rem', fontSize: '0.7rem' }}><LiveBadge /></div>}
                                    <h3 style={{ fontSize: '1.1rem', lineHeight: 1.3, fontWeight: 900, marginBottom: '0.3rem', color: '#111' }}>
                                        {story.title}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {story.subdeck}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                );
            })}

        </div>
    );
};

export default Home;
