import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

const Dashboard: React.FC = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        const { data } = await supabase
            .from('articles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (data) setArticles(data);
        setLoading(false);
    };

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
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
                    fontSize: '0.9rem'
                }}>
                    + New Article
                </Link>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Total Articles', value: articles.length, color: '#000' },
                    { label: 'Total Views', value: '12.4k', color: '#000' },
                    { label: 'Active Editors', value: '3', color: '#000' },
                    { label: 'System Status', value: 'Live', color: '#10b981' },
                ].map((stat, i) => (
                    <div key={i} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Articles Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', fontWeight: 700 }}>Recent Articles</div>
                {loading ? <p style={{ padding: '2rem' }}>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', width: '40%' }}>Title</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Slug</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr key={article.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
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
                                        <Link to={`/admin/edit/${article.id}`} style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Edit</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
