import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import SafeImage from '../components/SafeImage';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setArticles([]);
                setLoading(false);
                return;
            }
            setLoading(true);

            // Sanitize query to avoid breaking the OR syntax (commas are separators)
            const safeQuery = query.replace(/,/g, ' ');
            const { data, error } = await supabase
                .from('articles')
                .select(`
                    *,
                    categories ( name ),
                    article_authors (
                        users ( full_name )
                    )
                `)
                .or(`title.ilike.%${safeQuery}%,subdeck.ilike.%${safeQuery}%`)
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (data) {
                setArticles(data);
            } else if (error) {
                console.error('Error searching articles:', error);
            }
            setLoading(false);
        };

        fetchResults();
    }, [query]);

    return (
        <div className="container page-top-margin" style={{ fontFamily: 'var(--font-main)', direction: 'rtl' }}>
            <header style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>ڳولا جا نتيجا: "{query}"</h1>
                <p style={{ color: '#666' }}>{articles.length} مضمون مليل</p>
            </header>

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '5rem' }}>
                    {loading ? (
                        <div style={{ padding: '4rem 0' }}><LoadingSpinner /></div>
                    ) : articles.length > 0 ? articles.map((art) => (
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
                                        fontWeight: 900,
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
                                        <span>قلمڪار: {art.article_authors?.[0]?.users?.full_name || 'اسٽاف'}</span>
                                        <span>{new Date(art.published_at || art.created_at).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )) : !loading && (
                        <div style={{ textAlign: 'center', padding: '5rem', color: '#999', fontSize: '1.2rem' }}>
                            معاف ڪجو، ڪجهه به نه مليو.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
