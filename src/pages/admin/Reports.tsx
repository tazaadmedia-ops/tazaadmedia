import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Mail, Calendar, User, MessageCircle } from 'lucide-react';

const Reports: React.FC = () => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions:', error);
        } else if (data) {
            setSubmissions(data);
        }
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AdminLayout>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Contact Reports</h1>
                <p style={{ color: '#666' }}>View and manage messages sent through the website contact form.</p>
            </div>

            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageCircle size={20} />
                    Recent Submissions
                </div>

                {loading ? (
                    <p style={{ padding: '2rem' }}>Loading submissions...</p>
                ) : submissions.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                        <Mail size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No messages found yet.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', width: '20%' }}>Sender</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', width: '20%' }}>Email</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', width: '40%' }}>Message</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', width: '20%' }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                            <User size={14} color="#666" />
                                            {item.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem', color: '#666' }}>
                                        {item.email}
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem' }}>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: '#333',
                                            lineHeight: 1.5,
                                            maxWidth: '500px',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {item.message}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: '#888' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} />
                                            {formatDate(item.created_at)}
                                        </div>
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

export default Reports;
