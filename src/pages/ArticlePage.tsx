import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Figure } from '../extensions/Figure';
import LinkExtension from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { RelatedArticle } from '../extensions/RelatedArticle';
import { Twitter } from '../extensions/Twitter';
import SEO from '../components/SEO';
import SafeImage from '../components/SafeImage';
import LiveUpdateTimeline from '../components/LiveUpdateTimeline';
import type { LiveUpdate } from '../components/LiveUpdateTimeline';
import { Calendar, Share2, Twitter as TwitterIcon, Facebook, MessageCircle } from 'lucide-react';
import SkeletonArticle from '../components/SkeletonArticle';



const CATEGORY_MAP: Record<string, string> = {
    'Politics': 'سياست',
    'Technology': 'ٽيڪنالاجي',
    'Sports': 'رانديون',
    'Health': 'صحت',
    'Culture': 'ثقافت',
    'Opinion': 'راءِ',
    'News': 'خبرون'
};

const MONTHS_SINDHI = [
    'جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون',
    'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'
];

const formatSindhiDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = d.getDate();
    const month = MONTHS_SINDHI[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
};

const ArticlePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<any>(null);
    const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
    const [authorName, setAuthorName] = useState<string | null>(null);
    const [authorUsername, setAuthorUsername] = useState<string | null>(null);
    const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);

    const [categoryName, setCategoryName] = useState('News');
    const [updates, setUpdates] = useState<LiveUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showShareOptions, setShowShareOptions] = useState(false);


    const editor = useEditor({
        editable: false,
        extensions: [
            StarterKit,
            Figure,
            RelatedArticle,
            Twitter,
            Youtube,
            LinkExtension,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-lg mx-auto focus:outline-none',
                style: 'font-family: var(--font-main);'
            },
        },
    });

    // 1. Fetch Article Data
    useEffect(() => {
        const fetchArticleAndRelated = async () => {
            if (!slug) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setArticle(null); // Reset article on slug change

            try {
                // Fetch Main Article by Slug
                const { data: art, error } = await supabase
                    .from('articles')
                    .select(`
                    *,
                    categories ( name ),
                    article_authors (
                        users ( id, full_name, username, avatar_url )
                    )
                `)

                    .eq('slug', slug)
                    .single();

                if (error) throw error;

                if (art) {
                    setArticle(art);

                    // Author Extraction (Robust)
                    if (art.article_authors && art.article_authors.length > 0) {
                        const authorRel = art.article_authors[0];
                        const user = Array.isArray(authorRel.users) ? authorRel.users[0] : authorRel.users;
                        if (user && user.full_name) {
                            setAuthorName(user.full_name);
                            setAuthorUsername(user.username);
                            setAuthorAvatar(user.avatar_url);
                        }
                    }


                    // Category Translation
                    if (art.categories) {
                        const rawName = art.categories.name;
                        setCategoryName(CATEGORY_MAP[rawName] || rawName);
                    }

                    // Fetch Updates if any exist for this article
                    const { data: upds } = await supabase
                        .from('live_updates')
                        .select('*')
                        .eq('article_id', art.id)
                        .order('published_at', { ascending: false });

                    if (upds) {
                        const sorted = [...upds].sort((a, b) => {
                            if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
                            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
                        });
                        setUpdates(sorted);
                    }

                    // Fetch Related Articles
                    if (art.primary_category_id) {
                        const { data: related } = await supabase
                            .from('articles')
                            .select('id, title, slug, featured_image_url, primary_category_id')
                            .eq('primary_category_id', art.primary_category_id)
                            .neq('slug', slug)
                            .eq('status', 'published')
                            .limit(3);

                        if (related) setRelatedArticles(related);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching article:', error);
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArticleAndRelated();
    }, [slug]);

    useEffect(() => {
        if (article?.id) {
            // Increment view count in background
            supabase.rpc('increment_view_count', { article_id: article.id })
                .then(({ error }) => {
                    if (error) {
                        // Fallback if RPC doesn't exist: simple update
                        supabase
                            .from('articles')
                            .update({ view_count: (article.view_count || 0) + 1 })
                            .eq('id', article.id)
                            .then(({ error: updateError }) => {
                                if (updateError) console.error('Error incrementing view count:', updateError);
                            });
                    }
                });
        }
    }, [article?.id]);

    // 2. Update Editor Content when Article and Editor are ready
    useEffect(() => {
        if (editor && article) {
            try {
                // const currentContent = editor.getJSON(); // or getText check?
                // Avoid resetting if already matching to prevent cursor jumps if we were editing (but this is read-only)
                // For read-only, just set it.
                // We check if content is empty to avoid double setting? 
                // Actually, just set it. It's safe given the dependency on 'article'.
                editor.commands.setContent(article.content_json || article.content_text || '');
            } catch (e) {
                console.warn('Error setting editor content:', e);
            }
        }
    }, [editor, article]);

    // Scroll to top when slug changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // Text Reveal Animation Observer
    useEffect(() => {
        if (!article || (!article.content_json && !article.content_text)) return;

        // Give the editor a moment to render content
        const timeoutId = setTimeout(() => {
            const elements = document.querySelectorAll('.article-content .ProseMirror > *');
            if (elements.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Only animate once
                    }
                });
            }, {
                root: null,
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px' // Trigger slightly before it comes fully into view
            });

            elements.forEach((el, index) => {
                // Add base class and slightly delay early elements so they don't pop instantly on load
                el.classList.add('reveal-text');
                if (index < 3) {
                    setTimeout(() => {
                        el.classList.add('is-visible');
                        observer.unobserve(el);
                    }, index * 100);
                } else {
                    observer.observe(el);
                }
            });

            return () => {
                elements.forEach(el => observer.unobserve(el));
            };
        }, 300); // 300ms delay to ensure Tiptap has mounted HTML

        return () => clearTimeout(timeoutId);
    }, [article, slug]); // Re-run when article changes

    const handleShare = () => {
        setShowShareOptions(!showShareOptions);
    };

    if (loading) return <SkeletonArticle />;

    if (!article) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>مضمون نہ مليو</div>;

    if (!article) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>مضمون نہ مليو</div>;

    return (
        <article className="container article-page-container page-top-margin" style={{ fontFamily: 'var(--font-main)' }}>
            <SEO
                title={article.title}
                description={article.subdeck || article.title}
                image={article.featured_image_url}
                slug={`${slug}`}
                type="article"
                publishedAt={article.published_at || article.created_at}
                author={authorName || undefined}
                articleBody={article.content_text}
                schemaType="NewsArticle"
            />

            {/* Header */}
            <header className="article-header compact-article-header" style={{ marginBottom: '3rem', textAlign: 'right', direction: 'rtl', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ● {categoryName}
                </div>
                <h1 className="article-title compact-article-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#111' }}>
                    {article.title}
                </h1>

                {article.subdeck && (
                    <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem', lineHeight: 1.5, fontWeight: 500 }}>
                        {article.subdeck}
                    </p>
                )}

                <div className="compact-meta-row" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    {/* Author Row */}
                    {authorName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {authorAvatar ? (
                                <img
                                    src={authorAvatar}
                                    alt={authorName}
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1px solid #eee'
                                    }}
                                />
                            ) : (
                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 800, fontSize: '0.9rem' }}>
                                    {authorName.charAt(0)}
                                </div>
                            )}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1px' }}>قلمڪار</div>
                                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111' }}>
                                    {authorUsername ? (
                                        <Link to={`/author/${authorUsername}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {authorName}
                                        </Link>
                                    ) : authorName}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date & Action Row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                            <Calendar size={16} strokeWidth={2} />
                            <span>{formatSindhiDate(article.published_at || article.created_at)}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <button
                                onClick={handleShare}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    color: '#111',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    fontFamily: 'var(--font-main)'
                                }}
                            >
                                <Share2 size={18} strokeWidth={2.5} />
                                <span>شيئر ڪريو</span>
                            </button>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                borderRight: '1px solid #eee',
                                paddingRight: '1rem',
                                marginRight: '0.5rem',
                                opacity: showShareOptions ? 1 : 0,
                                visibility: showShareOptions ? 'visible' : 'hidden',
                                transform: showShareOptions ? 'translateX(0)' : 'translateX(10px)',
                                transition: 'all 0.3s ease'
                            }}>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(article.title + (article.subdeck ? '\n' + article.subdeck : '') + '\n' + window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#000', display: 'flex' }}
                                    title="WhatsApp تي شيئر ڪريو"
                                >
                                    <MessageCircle size={20} fill="currentColor" strokeWidth={0} />
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title + (article.subdeck ? '\n' + article.subdeck : ''))}&url=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#000', display: 'flex' }}
                                    title="X تي شيئر ڪريو"
                                >
                                    <TwitterIcon size={18} fill="currentColor" strokeWidth={0} />
                                </a>
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#000', display: 'flex' }}
                                    title="Facebook تي شيئر ڪريو"
                                >
                                    <Facebook size={20} fill="currentColor" strokeWidth={0} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>


            {/* Featured Image */}
            {article.featured_image_url && (
                <div className="full-bleed-mobile" style={{ marginBottom: '1rem', width: '100%', maxWidth: '1080px', margin: '0 auto 1rem auto' }}>
                    <SafeImage
                        src={article.featured_image_url}
                        alt={article.title}
                        fetchPriority="high"
                        width="1200"
                        height="675"
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '4px' }}
                        className="full-bleed-mobile"
                    />
                    {article.featured_image_caption && (
                        <figcaption className="featured-image-caption">
                            {article.featured_image_caption}
                        </figcaption>
                    )}
                </div>
            )}

            {/* Content - Only render if there's content to show */}
            {article.content_json || article.content_text ? (
                <div className="article-content" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.65', color: '#2c2c2c' }}>
                    <EditorContent editor={editor} />
                </div>
            ) : null}

            {/* Render Timeline for archived live blogs */}
            {updates.length > 0 && (
                <div style={{ maxWidth: '800px', margin: '0 auto 2rem', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                        <div style={{ backgroundColor: '#6b7280', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>آرڪائيو</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                            لائيو اپڊيٽس جو آرڪائيو ({updates.length} اپڊيٽس)
                        </div>
                    </div>
                    <LiveUpdateTimeline updates={updates} isLiveProfile={false} />
                </div>
            )}

            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
                <div style={{ maxWidth: '800px', margin: '4rem auto 2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        وڌيڪ پڙهو {categoryName}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
                        {relatedArticles.map((rel) => (
                            <Link key={rel.id} to={`/article/${rel.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ aspectRatio: '16/9', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '0.8rem', overflow: 'hidden' }}>
                                    <SafeImage
                                        src={rel.featured_image_url}
                                        alt={rel.title}
                                        width="600"
                                        height="338"
                                        loading="lazy"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, color: '#111' }}>
                                    {rel.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer with Minimal Separator */}
            <footer style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #f0f0f0', maxWidth: '800px', margin: '4rem auto 0', color: '#888' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1rem' }}>
                    <span>واپس وڃو</span> <span>→</span>
                </Link>
            </footer>
        </article>
    );
};

export default ArticlePage;
