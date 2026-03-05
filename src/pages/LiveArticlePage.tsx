import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';
import LivePulseIndicator from '../components/LivePulseIndicator';
import LiveUpdateTimeline from '../components/LiveUpdateTimeline';
import type { LiveUpdate } from '../components/LiveUpdateTimeline';

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
    const [pendingUpdates, setPendingUpdates] = useState<LiveUpdate[]>([]);
    const [authorName, setAuthorName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
    const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
    const updatesRef = useRef<LiveUpdate[]>([]);

    useEffect(() => {
        updatesRef.current = updates;
    }, [updates]);



    useEffect(() => {
        const fetchLiveArticle = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                // Fetch Article
                const { data: art, error: artError } = await supabase
                    .from('articles')
                    .select('id, title, subdeck, slug, featured_image_url, published_at, created_at, is_live, article_authors(users(full_name))')
                    .eq('slug', slug)
                    // .eq('is_live', true) // Ideally uncomment when DB is fully populated
                    .single();

                if (artError) throw artError;
                if (art) {
                    const articleWithAuthors = art as any;
                    setArticle(art);
                    if (articleWithAuthors.article_authors?.[0]?.users?.full_name) {
                        setAuthorName(articleWithAuthors.article_authors[0].users.full_name);
                    }

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
    }, [slug]);

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

                            const currentIds = new Set(updatesRef.current.map(u => u.id));
                            const newlyAdded = sorted.filter(u => !currentIds.has(u.id));

                            if (newlyAdded.length > 0) {
                                console.log('Found new pending updates:', newlyAdded.length);
                                setPendingUpdates(prevPending => {
                                    const pendingIds = new Set(prevPending.map(p => p.id));
                                    const trulyNew = newlyAdded.filter(n => !pendingIds.has(n.id));
                                    if (trulyNew.length === 0) return prevPending;
                                    return [...trulyNew, ...prevPending];
                                });
                            }

                            // Sync edits/deletions for currently displayed items
                            setUpdates(current => {
                                return current.map(cu => sorted.find(s => s.id === cu.id) || cu)
                                    .filter(cu => sorted.some(s => s.id === cu.id));
                            });
                        }
                    });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [article, autoUpdateEnabled]);


    const handleShowPending = useCallback(() => {
        if (pendingUpdates.length === 0) return;

        // Capture the newest update ID to scroll to it
        const newestId = pendingUpdates[0].id;

        const newIds = new Set(pendingUpdates.map(u => u.id));
        setNewlyAddedIds(newIds);

        setUpdates(prev => {
            const merged = [...pendingUpdates, ...prev];
            return merged.sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
            });
        });
        setPendingUpdates([]);

        // Scroll to the newest update
        setTimeout(() => {
            const element = document.getElementById(`update-${newestId}`);
            if (element) {
                // Scroll with offset to avoid header if necessary, or just center
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        // Clear animation state after 3 seconds
        setTimeout(() => {
            setNewlyAddedIds(new Set());
        }, 3000);
    }, [pendingUpdates]);

    if (loading) return <div className="container page-top-margin" style={{ textAlign: 'center' }}><LoadingSpinner /></div>;
    if (!article) return <div className="container page-top-margin" style={{ textAlign: 'center' }}>لائيو مضمون نہ مليو</div>;

    // Redirect to normal article page if the live blog has ended
    // Only redirect if explicitly ended (is_live === false) and loading is finished
    if (article && article.is_live === false) {
        return <Navigate to={`/article/${slug}`} replace />;
    }

    // Construct LiveBlogPosting Schema
    const liveBlogSchema = article ? {
        "@type": "LiveBlogPosting",
        "headline": article.title,
        "description": article.subdeck || article.title,
        "image": article.featured_image_url,
        "coverageStartTime": article.published_at || article.created_at,
        "coverageEndTime": article.is_live ? undefined : (updates[0]?.published_at || article.updated_at),
        "author": {
            "@type": "Person",
            "name": authorName || "Tazaad Staff"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Tazaad",
            "logo": {
                "@type": "ImageObject",
                "url": "https://thetazaad.com/logo.png"
            }
        },
        "liveBlogUpdate": updates.slice(0, 10).map(upd => ({
            "@type": "BlogPosting",
            "headline": upd.title || `Update at ${new Date(upd.published_at).toLocaleTimeString()}`,
            "articleBody": upd.content,
            "datePublished": upd.published_at,
            "author": {
                "@type": "Person",
                "name": authorName || "Tazaad Staff"
            }
        }))
    } : null;

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: '4rem' }}>
            <SEO
                title={`لائيو: ${article.title}`}
                description={article.subdeck || article.title}
                image={article.featured_image_url}
                slug={`live/${slug}`}
                type="article"
                publishedAt={article.published_at || article.created_at}
                author={authorName || undefined}
                schemaType="LiveBlogPosting"
                jsonLd={liveBlogSchema}
            />

            {/* Featured Media - Full Bleed Top */}
            {article.featured_image_url && (
                <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                    <img src={article.featured_image_url} alt={article.title} fetchPriority="high" style={{ width: '100%', maxHeight: '65vh', objectFit: 'cover', objectPosition: 'center' }} />
                    {article.featured_image_caption && (
                        <div className="container" style={{ maxWidth: '1000px' }}>
                            <figcaption className="featured-image-caption">
                                {article.featured_image_caption}
                            </figcaption>
                        </div>
                    )}
                </div>
            )}

            <div className="container page-top-margin" style={{ maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', paddingTop: article.featured_image_url ? '0' : undefined }}>
                <div>
                    {/* Header Content Below Image */}
                    <div style={{ marginBottom: '2.5rem', textAlign: 'right', direction: 'rtl' }}>
                        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'flex-start' }}>
                            <LivePulseIndicator text="لائيو" />
                        </div>

                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.25, color: '#111827', marginBottom: '1.5rem', letterSpacing: '-0.02em', fontFeatureSettings: "'kern' 1" }}>
                            {article.title}
                        </h1>

                        <p style={{ fontSize: '1.35rem', color: '#4b5563', marginBottom: '2rem', lineHeight: 1.6, fontWeight: 500 }}>
                            {article.subdeck}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', fontSize: '0.95rem', color: '#6b7280' }}>
                            {authorName && <div>قلمڪار: <span style={{ fontWeight: 700, color: '#111827' }}>{authorName}</span></div>}
                            <span>•</span>
                            <div>{formatSindhiDate(article.published_at || article.created_at)}</div>
                        </div>
                    </div>

                </div>




                {/* Updates Section Header */}
                <div style={{ position: 'relative' }}>
                    <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>
                            {updates.length + pendingUpdates.length} اپڊيٽس
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

                    {pendingUpdates.length > 0 && (
                        <div style={{ position: 'fixed', top: '160px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
                            <button
                                onClick={handleShowPending}
                                style={{
                                    backgroundColor: '#b91c1c',
                                    color: 'white',
                                    padding: '10px 24px',
                                    borderRadius: '100px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    border: 'none',
                                    display: 'inline-flex',
                                    flexDirection: 'row-reverse',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    animation: 'slideDown 0.3s ease-out',
                                    direction: 'rtl',
                                    fontFamily: "'SF Arabic', 'Inter', system-ui, sans-serif"
                                }}
                            >
                                <RefreshCw size={16} className="animate-spin-slow" />
                                <span>
                                    {pendingUpdates.length === 1
                                        ? `${pendingUpdates.length} نئين اپڊيٽ ڏسو`
                                        : `${pendingUpdates.length} نيون اپڊيٽس ڏسو`
                                    }
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <LiveUpdateTimeline updates={updates} isLiveProfile={true} newlyAddedIds={newlyAddedIds} />

                <style>
                    {`
                        @keyframes slideDown {
                            from { transform: translateY(-20px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                        .animate-spin-slow {
                            animation: spin 3s linear infinite;
                        }
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}
                </style>

            </div>
        </div>
    );
};

export default LiveArticlePage;
