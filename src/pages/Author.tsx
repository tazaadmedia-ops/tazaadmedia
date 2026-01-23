import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';

const AuthorPage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [author, setAuthor] = useState<any>(null);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthorData = async () => {
            if (!username) return;
            setLoading(true);

            // 1. Fetch Author Profile by Username
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();

            if (userData) {
                setAuthor(userData);

                // 2. Fetch Author's Articles using the User ID
                const { data: artData } = await supabase
                    .from('article_authors')
                    .select(`
                        article_id,
                        articles (
                            id,
                            title,
                            slug,
                            subdeck,
                            featured_image_url,
                            published_at,
                            created_at,
                            status
                        )
                    `)
                    .eq('author_id', userData.id);

                if (artData) {
                    // Filter for published articles and extract nested data
                    const processed = artData
                        .map((rel: any) => rel.articles)
                        .filter((a: any) => a && a.status === 'published')
                        .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());

                    setArticles(processed);
                }
            } else if (userError) {
                console.error('Error fetching author:', userError);
            }
            setLoading(false);
        };

        fetchAuthorData();
        window.scrollTo(0, 0);
    }, [username]);

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><LoadingSpinner /></div>;

    if (!author) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-main)' }}>ليکڪ نه مليو (Author Not Found)</h2>
                <Link to="/" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>واپس هوم پيج تي وڃو</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '0', fontFamily: 'var(--font-main)' }}>
            <SEO
                title={`${author.full_name} | Author`}
                description={author.bio || `Read articles by ${author.full_name}`}
                image={author.avatar_url}
                slug={`author/${username}`}
                schemaType="ProfilePage"
                type="website"
            />

            {/* Author Profile Header */}
            <div className="author-header">
                <div style={{ flexShrink: 0 }}>
                    <div style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        backgroundColor: '#eee',
                        backgroundImage: `url(${author.avatar_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid #ddd',
                    }} />
                </div>
                <div className="author-info">
                    <div className="meta-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1.5rem', marginBottom: '1rem' }}>
                        <h1 style={{
                            fontSize: '2.4rem',
                            fontWeight: 800,
                            margin: 0,
                            color: '#111',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {author.full_name}
                        </h1>
                    </div>
                    <p style={{
                        fontSize: '1.15rem',
                        lineHeight: 1.6,
                        color: '#333',
                        maxWidth: '800px',
                        marginBottom: '1rem'
                    }}>
                        {author.bio || 'هن ليکڪ لاءِ ڪا به بايو موجود ناهي.'}
                    </p>
                    <div className="meta-row" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>ليکڪ</span>
                    </div>
                </div>
            </div>

            {/* Latest Articles Feed */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', direction: 'rtl' }}>
                <div style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '0.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>تازو لکڻيون</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '4rem' }}>
                    {articles.length > 0 ? articles.map((art) => (
                        <div key={art.id} className="article-list-item mobile-grid-1">
                            <div style={{ order: 1 }}>
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
                            <div style={{ order: 2 }}>
                                <Link to={`/article/${art.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3 style={{
                                        fontSize: '1.6rem',
                                        fontWeight: 900,
                                        lineHeight: 1.3,
                                        marginBottom: '0.75rem',
                                        color: '#000',
                                    }}>
                                        {art.title}
                                    </h3>
                                    <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                                        {art.subdeck}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#999', justifyContent: 'flex-start' }}>
                                        <span>{new Date(art.published_at || art.created_at).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>هن وقت ڪو به مضمون موجود ناهي. (No articles found.)</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthorPage;
