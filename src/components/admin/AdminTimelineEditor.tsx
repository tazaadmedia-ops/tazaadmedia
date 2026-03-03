import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Check, X, Loader, Pin } from 'lucide-react';
import { format } from 'date-fns';

interface AdminTimelineEditorProps {
    articleId: string;
}

const AdminTimelineEditor: React.FC<AdminTimelineEditorProps> = ({ articleId }) => {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Editor State
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [isPinned, setIsPinned] = useState(false);

    useEffect(() => {
        if (!articleId || articleId === 'new') {
            setLoading(false);
            return;
        }
        fetchUpdates();
    }, [articleId]);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('live_updates')
                .select('*')
                .eq('article_id', articleId)
                .order('published_at', { ascending: false });

            if (error) throw error;
            if (data) setUpdates(data);
        } catch (error: any) {
            console.error("Error fetching updates:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenNew = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
        setMediaUrl('');
        setIsPinned(false);
        setIsOpen(true);
    };

    const handleEdit = (update: any) => {
        setEditingId(update.id);
        setTitle(update.title || '');
        setContent(update.content || '');
        setMediaUrl(update.media_url || '');
        setIsPinned(update.is_pinned || false);
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ڇا توھان واقعي ھن اپڊيٽ کي ختم ڪرڻ چاھيو ٿا؟')) return;
        try {
            const { error } = await supabase.from('live_updates').delete().eq('id', id);
            if (error) throw error;
            setUpdates(updates.filter(u => u.id !== id));
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return alert('Content is required');

        setIsSubmitting(true);

        const payload = {
            article_id: articleId,
            title,
            content,
            media_url: mediaUrl,
            is_pinned: isPinned,
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('live_updates').update(payload).eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('live_updates').insert([payload]);
                if (error) throw error;
            }

            await fetchUpdates(); // Refresh list to get proper time and ID
            setIsOpen(false);
        } catch (error: any) {
            alert('Error saving update: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!articleId || articleId === 'new') {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
                لائيو اپڊيٽس شامل ڪرڻ لاءِ پھريان مضمون کي محفوظ ڪريو.
            </div>
        );
    }

    return (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '2rem', direction: 'rtl' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>ٽائيم لائين اپڊيٽس</h3>
                {!isOpen && (
                    <button
                        onClick={handleOpenNew}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                        <Plus size={16} /> نئين اپڊيٽ شامل ڪريو
                    </button>
                )}
            </div>

            {/* Editor Panel */}
            {isOpen && (
                <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontWeight: 700 }}>{editingId ? 'اپڊيٽ تبديل ڪريو' : 'نئين لائيو اپڊيٽ'}</h4>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="عنوان (اختياري)"
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', fontSize: '1rem' }}
                        />

                        <textarea
                            value={content} onChange={e => setContent(e.target.value)}
                            placeholder="اپڊيٽ جو تفصيل (HTML سپورٽ ٿيل)..."
                            rows={5}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', fontSize: '1rem', resize: 'vertical' }}
                        />

                        <input
                            value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
                            placeholder="عڪس/ميڊيا يو آر ايل (اختياري)"
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', fontSize: '0.9rem' }}
                        />

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                            <input
                                type="checkbox"
                                checked={isPinned}
                                onChange={e => setIsPinned(e.target.checked)}
                                style={{ width: '18px', height: '18px', accentColor: '#dc2626' }}
                            />
                            ھن اپڊيٽ کي پِن (Pin) ڪريو
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setIsOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>منسوخ</button>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                        >
                            {isSubmitting ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                            محفوظ ڪريو
                        </button>
                    </div>
                </div>
            )}

            {/* List of Updates */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}><Loader className="animate-spin text-gray-400" /></div>
            ) : updates.length === 0 && !isOpen ? (
                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#6b7280' }}>
                    ڪا به اپڊيٽ موجود ناهي. پھريون شامل ڪريو.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {updates.map(update => (
                        <div key={update.id} style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: 'white', border: `1px solid ${update.is_pinned ? '#fecaca' : '#e5e7eb'}`, borderRadius: '8px', position: 'relative' }}>
                            {update.is_pinned && <Pin size={16} color="#dc2626" style={{ position: 'absolute', top: '10px', left: '10px' }} />}
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                    {format(new Date(update.published_at), 'MMM dd, yyyy HH:mm')}
                                </div>
                                {update.title && <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, fontSize: '1.1rem' }}>{update.title}</h5>}
                                <div style={{ color: '#374151', fontSize: '0.95rem' }} dangerouslySetInnerHTML={{ __html: update.content }} />
                                {update.media_url && <img src={update.media_url} style={{ maxHeight: '100px', marginTop: '10px', borderRadius: '4px' }} alt="update media" />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '1rem', borderRight: '1px solid #f3f4f6' }}>
                                <button onClick={() => handleEdit(update)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: '4px' }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(update.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminTimelineEditor;
