import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';

const CATEGORY_MAP: Record<string, string> = {
    'analysis': 'تجزيا',
    'special-reports': 'خصوصي رپورٽون',
    'sindh': 'سنڌ',
    'region': 'خطو',
    'world': 'دنيا'
};

const DB_MAPPING: Record<string, string[]> = {
    'analysis': ['Opinion', 'Analysis', 'تجزيا'],
    'special-reports': ['Special Reports', 'Special Report', 'خصوصي رپورٽس'],
    'sindh': ['Sindh', 'سنڌ'],
    'region': ['Region', 'Nearby', 'خطو'],
    'world': ['World', 'International', 'دنيا']
};

const CategoryPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const displayName = slug ? (CATEGORY_MAP[slug] || slug) : 'Category';

    useEffect(() => {
        const fetchArticles = async () => {
            if (!slug) return;
            setLoading(true);

            const dbNames = DB_MAPPING[slug] || [slug];

            const { data, error } = await supabase
                .from('articles')
                .select(`
                    *,
                    categories!inner( name ),
                    article_authors (
                        users ( full_name )
                    )
                `)
                .in('categories.name', dbNames)
                .eq('status', 'published')
                .order('updated_at', { ascending: false });

            if (data) {
                setArticles(data);
            } else if (error) {
                console.error('Error fetching category articles:', error);
            }
            setLoading(false);
        };

        fetchArticles();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><LoadingSpinner /></div>;

    return (
        <div className="container" style={{ marginTop: '2rem', fontFamily: 'var(--font-main)', direction: 'rtl' }}>
            <SEO
                title={`${displayName} | News`}
                description={`Latest articles in ${displayName}`}
                slug={`category/${slug}`}
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
                                <Link to={`/article/${art.slug}`}>
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '16/10',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                        backgroundImage: `url(${art.featured_image_url})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }} />
                                </Link>
                            </div>
                            <div>
                                <Link to={`/article/${art.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
