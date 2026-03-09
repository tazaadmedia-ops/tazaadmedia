import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SkeletonList from '../components/SkeletonList';
import SEO from '../components/SEO';
import SafeImage from '../components/SafeImage';

const CategoryPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [articles, setArticles] = useState<any[]>([]);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const displayName = category?.name || slug || 'Category';

    useEffect(() => {
        const fetchCategoryAndArticles = async () => {
            if (!slug) return;
            setLoading(true);

            try {
                // 1. Fetch category details by slug
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (catError) throw catError;

                if (catData) {
                    setCategory(catData);

                    // 2. Fetch published articles for this category ID
                    const { data, error } = await supabase
                        .from('articles')
                        .select(`
                            *,
                            categories ( name ),
                            article_authors (
                                users ( full_name )
                            )
                        `)
                        .eq('primary_category_id', catData.id)
                        .eq('status', 'published')
                        .order('published_at', { ascending: false })
                        .order('is_pinned', { ascending: false })
                        .order('is_live', { ascending: false })
                        .limit(12);

                    if (error) throw error;
                    if (data) setArticles(data);
                }
            } catch (error: any) {
                console.error('Error fetching category data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryAndArticles();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) return <SkeletonList />;


    return (
        <div className="container page-top-margin" style={{ fontFamily: 'var(--font-main)', direction: 'rtl' }}>
            <SEO
                title={`${displayName} | News`}
                description={`Latest articles in ${displayName}`}
                slug={`topic/${slug}`}
                schemaType="CollectionPage"
            />

            <header style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{displayName}</h1>
            </header>

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div className="mobile-grid-1" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '5rem' }}>
                    {articles.length > 0 ? articles.map((art) => (
                        <div key={art.id} className="mobile-grid-1" style={{
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr',
                            gap: '3rem',
                            borderBottom: '1px solid #f0f0f0',
                            paddingBottom: '3rem',
                            textAlign: 'right'
                        }}>
                            <div>
                                <Link to={`/${art.slug}`}>
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '16/10',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <SafeImage
                                            src={art.featured_image_url}
                                            alt={art.title}
                                            width="600"
                                            height="375"
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                </Link>
                            </div>
                            <div>
                                <Link to={`/${art.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h2 style={{
                                        fontSize: '1.8rem',
                                        fontWeight: 800,
                                        lineHeight: 1.3,
                                        marginBottom: '1rem',
                                        color: '#000',
                                    }}>
                                        {art.title}
                                    </h2>
                                    <p style={{ color: '#444', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                                        {art.subdeck}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#888' }}>
                                        {art.article_authors?.[0]?.users?.full_name && (
                                            <span>قلمڪار: {art.article_authors[0].users.full_name}</span>
                                        )}
                                        <span>{new Date(art.published_at || art.created_at).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '5rem', color: '#999', fontSize: '1.2rem' }}>
                            هن ڪيٽيگريءَ ۾ في الحال ڪو مضمون ناهي.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
