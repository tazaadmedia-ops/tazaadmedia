import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';
import LivePulseIndicator from '../components/LivePulseIndicator';
import LiveUpdateTimeline from '../components/LiveUpdateTimeline';
import type { LiveUpdate } from '../components/LiveUpdateTimeline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const formatSindhiDate = (dateString: string) => {
    if (!dateString) return '';
    const MONTHS_SINDHI = ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'];
    const d = new Date(dateString);
    return `${d.getDate()} ${MONTHS_SINDHI[d.getMonth()]} ${d.getFullYear()}`;
};

const LiveArticlePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<any>(null);
    const [updates, setUpdates] = useState<LiveUpdate[]>([]);
    const [authorName, setAuthorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

    const editor = useEditor({
        editable: false,
        extensions: [StarterKit], // Simplified for just summary render
        editorProps: {
            attributes: { class: 'prose prose-lg focus:outline-none', style: 'font-family: var(--font-main);' },
        },
    });

    useEffect(() => {
        const fetchLiveArticle = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // Fetch Article
                const { data: art, error: artError } = await supabase
                    .from('articles')
                    .select('*, article_authors(users(full_name))')
                    .eq('slug', slug)
                    // .eq('is_live', true) // Ideally uncomment when DB is fully populated
                    .single();

                if (artError) throw artError;
                if (art) {
                    setArticle(art);
                    if (art.article_authors?.[0]?.users?.full_name) {
                        setAuthorName(art.article_authors[0].users.full_name);
                    }
                    if (editor) editor.commands.setContent(art.content_json || art.content_text || '');

                    // Fetch Updates (Mocking query if table doesn't exist yet gracefully)
                    const { data: upds, error: updError } = await supabase
                        .from('live_updates')
                        .select('*')
                        .eq('article_id', art.id)
                        .order('is_pinned', { ascending: false }) // Pinned first? Actually chronologically is better for timeline, pinned handled visually maybe
                        .order('published_at', { ascending: false }); // Newest first

                    if (!updError && upds) {
                        // Sort explicitly: Pinned at top, then newest first
                        const sorted = [...upds].sort((a, b) => {
                            if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
                        });
                        setUpdates(sorted);
                    }
                }
            } catch (error) {
                console.error("Error loading live article:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveArticle();
    }, [slug, editor]);

    // Realtime Subscription
    useEffect(() => {
        if (!article || !autoUpdateEnabled) return;

        const subscription = supabase
            .channel(`public:live_updates:article_id=${article.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'live_updates', filter: `article_id=eq.${article.id}` }, payload => {
                console.log('Realtime Update Received:', payload);
                // In a real app, handle INSERT, UPDATE, DELETE to sync state
                // For simplicity here, we'll just trigger a refetch or optimistic UI update
                // To avoid complex state merging logic for this MVP, quick refetch:
                supabase
                    .from('live_updates')
                    .select('*')
                    .eq('article_id', article.id)
                    .order('published_at', { ascending: false })
                    .then(({ data }) => {
                        if (data) {
                            const sorted = [...data].sort((a, b) => {
                                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                                return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
                            });
                            setUpdates(sorted);
                        }
                    });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [article, autoUpdateEnabled]);


    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}><LoadingSpinner /></div>;
    if (!article) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>لائيو مضمون نہ مليو</div>;

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '4rem' }}>
            <SEO title={`LIVE: ${article.title}`} description={article.subdeck} image={article.featured_image_url} />

            {/* Top Banner (Optional full bleed header) */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '2rem 0', marginBottom: '2rem' }}>
                <div className="container" style={{ maxWidth: '1000px' }}>

                    <div style={{ marginBottom: '1rem' }}>
                        <LivePulseIndicator />
                    </div>

                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.2, color: '#111827', marginBottom: '1rem' }}>
                        {article.title}
                    </h1>

                    <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        {article.subdeck}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                        {authorName && <div>قلمڪار: <span style={{ fontWeight: 600, color: '#111827' }}>{authorName}</span></div>}
                        <span>•</span>
                        <div>{formatSindhiDate(article.published_at || article.created_at)}</div>
                    </div>

                </div>
            </div>

            <div className="container" style={{ maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
                {/* Desktop could be 2 columns, but timeline designs often work best as single column taking center stage, 
                     or main left rail right. Since RTL, main right rail left. 
                     Let's do Main Content + Timeline in one flowing column for simplicity matching AlJazeera style closely */
                }

                <div>
                    {/* Featured Media */}
                    {article.featured_image_url && (
                        <div style={{ marginBottom: '2.5rem', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <img src={article.featured_image_url} alt={article.title} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                        </div>
                    )}

                    {/* Article Summary (The initial writeup) */}
                    <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '3rem' }}>
                        <div className="article-content" style={{ fontSize: '1.1rem', margin: 0 }}>
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    {/* Updates Section Header */}
                    <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>
                            {updates.length} اپڊيٽس
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#4b5563' }}>
                            <label htmlFor="autoUpdateToggle" style={{ cursor: 'pointer' }}>آٽو اپڊيٽس</label>
                            <input
                                id="autoUpdateToggle"
                                type="checkbox"
                                checked={autoUpdateEnabled}
                                onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                                style={{ width: '40px', height: '20px', cursor: 'pointer', accentColor: '#dc2626' }}
                            />
                        </div>
                    </div>

                    {/* Timeline */}
                    <LiveUpdateTimeline updates={updates} />

                </div>
            </div>
        </div>
    );
}

export default LiveArticlePage;
