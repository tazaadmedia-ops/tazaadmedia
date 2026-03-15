import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Eye, Trash2, Edit2 } from 'lucide-react';

const DashboardSkeleton = () => (
    <div className="reveal-text is-visible" style={{ padding: '0 1.5rem 1.5rem' }}>
        {[...Array(10)].map((_, i) => (
            <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.5rem', 
                padding: '1.2rem 0',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div className="skeleton" style={{ width: '64px', height: '40px', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ width: '20%', height: '10px' }} />
                </div>
                <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '20px' }} />
                <div className="skeleton" style={{ width: '40px', height: '20px', borderRadius: '20px' }} />
                <div className="skeleton" style={{ width: '100px', height: '18px' }} />
            </div>
        ))}
    </div>
);

const Dashboard: React.FC = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('admin');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchArticles();
    }, [currentPage, searchTerm]);

    const fetchArticles = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
        const role = userData?.role || 'admin';
        setUserRole(role);

        let query;
        
        if (role === 'author') {
            query = supabase
                .from('articles')
                .select(`
                    *,
                    article_authors!inner (author_id)
                `, { count: 'exact' })
                .eq('article_authors.author_id', user.id);
        } else {
            query = supabase
                .from('articles')
                .select('*', { count: 'exact' });
        }

        if (searchTerm) {
            query = query.or(`title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
        }

        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count } = await query
            .order('published_at', { ascending: false })
            .range(from, to);
        
        setArticles(data || []);
        setTotalCount(count || 0);
        setLoading(false);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`ڇا توھان پڪ سان ھن مضمون کي ختم ڪرڻ چاھيو ٿا؟\n"${title}"\n(Are you sure you want to delete this article?)`)) return;

        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            setArticles(articles.filter(a => a.id !== id));
        }
    };

    const handleToggleLive = async (articleId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('articles')
            .update({ is_live: !currentStatus })
            .eq('id', articleId);

        if (error) {
            alert('Error updating status: ' + error.message);
        } else {
            setArticles(articles.map(a => a.id === articleId ? { ...a, is_live: !currentStatus } : a));
        }
    };

    const totalViews = articles.reduce((sum, article) => sum + (article.view_count || 0), 0);

    const formatViews = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    const filteredArticles = articles; // Now filtered on server

    return (
        <AdminLayout>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: '#666' }}>Manage your content and website statistics.</p>
                </div>
                <Link to="/admin/new" style={{
                    backgroundColor: 'var(--color-accent)',
                    color: '#fff',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap'
                }}>
                    + New Article
                </Link>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {[
                    { label: userRole === 'author' ? 'My Articles' : 'Total Articles', value: articles.length, color: '#000' },
                    { label: 'Total Views', value: formatViews(totalViews), color: '#000' },
                    ...(userRole !== 'author' ? [
                        { label: 'Active Editors', value: '3', color: '#000' },
                        { label: 'System Status', value: 'Live', color: '#10b981' },
                    ] : [])
                ].map((stat, i) => (
                    <div key={i} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Articles Table Container */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ fontWeight: 700 }}>Recent Articles</div>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '0.85rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                        />
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }} className={!loading ? 'reveal-text is-visible' : ''}>
                    {loading ? <DashboardSkeleton /> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', width: '80px' }}>Cover</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', width: '35%' }}>Title</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Slug</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Status</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Live</th>
                                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArticles.map((article) => (
                                    <tr key={article.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '0.8rem 1.5rem' }}>
                                            {article.featured_image_url ? (
                                                <img src={article.featured_image_url} style={{ width: '64px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} alt="" />
                                            ) : (
                                                <div style={{ width: '64px', height: '40px', backgroundColor: '#f3f4f6', borderRadius: '4px', border: '1px solid #eee' }} />
                                            )}
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {article.title}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#666', fontFamily: 'monospace' }}>
                                            /{article.slug}
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <span style={{
                                                backgroundColor: article.status === 'published' ? '#dcfce7' : article.status === 'scheduled' ? '#fef9c3' : '#f3f4f6',
                                                color: article.status === 'published' ? '#166534' : article.status === 'scheduled' ? '#854d0e' : '#666',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                display: 'inline-block',
                                                textTransform: 'capitalize'
                                            }}>
                                                {article.status || 'draft'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <div
                                                onClick={() => handleToggleLive(article.id, article.is_live)}
                                                style={{
                                                    width: '40px',
                                                    height: '20px',
                                                    backgroundColor: article.is_live ? '#ef4444' : '#e5e7eb',
                                                    borderRadius: '20px',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: '#fff',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    top: '2px',
                                                    left: article.is_live ? '22px' : '2px',
                                                    transition: 'left 0.2s'
                                                }} />
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <a
                                                    href={article.is_live ? `/live/${article.slug}` : `/${article.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#666', transition: 'color 0.2s' }}
                                                    title="View"
                                                >
                                                    <Eye size={18} />
                                                </a>
                                                <button
                                                    onClick={() => navigate(`/admin/edit/${article.id}`)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--color-accent)',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <Edit2 size={16} /> Edit
                                                </button>
                                                {userRole !== 'author' && (
                                                    <button
                                                        onClick={() => handleDelete(article.id, article.title)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            transition: 'opacity 0.2s'
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                <div style={{
                    padding: '1.2rem 1.5rem',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fafafa'
                }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        Showing {Math.min(articles.length, 1) + (currentPage - 1) * PAGE_SIZE} to {Math.min(totalCount, currentPage * PAGE_SIZE)} of {totalCount} entries
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff',
                                color: currentPage === 1 ? '#999' : '#333',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: currentPage === 1 ? 'default' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Previous
                        </button>
                        <button
                            disabled={currentPage * PAGE_SIZE >= totalCount || loading}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: currentPage * PAGE_SIZE >= totalCount ? '#f9fafb' : '#fff',
                                color: currentPage * PAGE_SIZE >= totalCount ? '#999' : '#333',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: currentPage * PAGE_SIZE >= totalCount ? 'default' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
