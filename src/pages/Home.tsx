import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';


// Config for Dynamic Sections
const SECTIONS_CONFIG = [
    { title: 'تجزيا', dbNames: ['Opinion', 'Analysis'], slug: 'analysis' },
    { title: 'خصوصي رپورٽون', dbNames: ['Special Reports', 'Special Report'], slug: 'special-reports' },
    { title: 'سنڌ', dbNames: ['Sindh'], slug: 'sindh' },
    { title: 'خطو', dbNames: ['Region', 'Nearby'], slug: 'region' },
    { title: 'دنيا', dbNames: ['World', 'International'], slug: 'world' },
];

const Home: React.FC = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        // Fetch more articles to cover sections
        const { data, error } = await supabase
            .from('articles')
            .select(`
                *,
                categories ( name, slug ),
                article_authors (
                    users ( full_name )
                )
            `)
            .eq('status', 'published')
            .order('updated_at', { ascending: false })
            .limit(50);

        if (error) console.error('Error fetching home articles:', error);
        if (data) setArticles(data);
        setLoading(false);
    };

    const getAuthor = (article: any) => {
        return article.article_authors?.[0]?.users?.full_name || 'Daadlo Staff';
    };

    const getCategory = (article: any) => {
        return article.categories?.name || 'News';
    };

    // Filter helper
    const getArticlesForSection = (dbNames: string[]) => {
        return articles.filter(a => {
            const catName = a.categories?.name;
            return catName && dbNames.includes(catName);
        }).slice(0, 4); // Limit to 4 per section
    };

    if (loading) return <LoadingSpinner />;

    // Distribute top items
    const heroStory = articles[0];
    const sideStories = articles.slice(1, 5);
    const bottomStories = articles.slice(5, 9);

    return (
        <div className="container" style={{ marginTop: '0', fontFamily: 'var(--font-main)' }}>
            <SEO
                title="Home"
                description="Open Editorial provides in-depth analysis, special reports, and latest news from Sindh and beyond."
                schemaType="WebSite"
            />

            {/* --- TOP LATEST NEWS --- */}

            {/* Hero + Side Grid */}
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Hero */}
                <div>
                    {heroStory ? (
                        <Link to={`/article/${heroStory.slug}`}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#eee', borderRadius: '0', marginBottom: '0.75rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {heroStory.featured_image_url ? (
                                        <img src={heroStory.featured_image_url} alt={heroStory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ color: '#999' }}>No Image</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                    ● {getCategory(heroStory)}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-lighter)', fontWeight: 500 }}>
                                    {getAuthor(heroStory)}
                                </span>
                            </div>
                            <h1 style={{ fontSize: '2rem', lineHeight: 1.15, marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#1A1A1A' }}>
                                {heroStory.title}
                            </h1>
                            <p style={{ fontSize: '1rem', color: 'var(--color-text-light)', lineHeight: 1.6, marginBottom: '0.5rem', fontWeight: 400 }}>
                                {heroStory.subdeck}
                            </p>
                        </Link>
                    ) : (
                        <div style={{ padding: '2rem', border: '1px dashed #ccc', textAlign: 'center' }}>No featured story yet. Publish one!</div>
                    )}
                </div>

                {/* Side Grid */}
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', alignContent: 'start' }}>
                    {sideStories.map(story => (
                        <div key={story.id}>
                            <Link to={`/article/${story.slug}`}>
                                <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                                    {story.featured_image_url && <img src={story.featured_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: '0.7rem', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                                    {getCategory(story)}
                                </div>
                                <h3 style={{ fontSize: '0.95rem', lineHeight: 1.3, fontWeight: 900, marginBottom: '0.3rem', letterSpacing: '-0.01em', color: '#1A1A1A' }}>
                                    {story.title}
                                </h3>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Text Row */}
            {bottomStories.length > 0 && (
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '3rem' }}>
                    {bottomStories.map((story, i) => (
                        <div key={story.id} style={{
                            paddingLeft: i < 3 ? '1.5rem' : 0,
                            borderRight: i < 3 ? '1px solid #E0E0E0' : 'none'
                        }}>
                            <Link to={`/article/${story.slug}`}>
                                <h3 style={{ fontSize: '1rem', lineHeight: 1.4, fontWeight: 900, marginBottom: '0.3rem', letterSpacing: '-0.01em', color: '#1A1A1A' }}>
                                    {story.title}
                                </h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-lighter)', fontWeight: 500 }}>
                                    {getAuthor(story)}
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}


            {/* --- DYNAMIC SECTIONS --- */}

            {SECTIONS_CONFIG.map((section) => {
                const sectionArticles = getArticlesForSection(section.dbNames);
                if (sectionArticles.length === 0) return null;

                return (
                    <div key={section.title} style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid black', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{section.title}</h2>
                            <Link
                                to={`/category/${section.slug}`}
                                style={{ fontSize: '0.9rem', fontWeight: 600, color: '#666', textDecoration: 'none' }}
                            >
                                ڏسو سڀ →
                            </Link>
                        </div>

                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {sectionArticles.map(story => (
                                <Link key={story.id} to={`/article/${story.slug}`}>
                                    <div style={{ width: '100%', aspectRatio: '16/10', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '0.8rem', overflow: 'hidden' }}>
                                        {story.featured_image_url ? (
                                            <img src={story.featured_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd', fontSize: '0.8rem' }}>No Image</div>
                                        )}
                                    </div>
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
