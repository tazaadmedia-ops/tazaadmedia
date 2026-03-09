import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
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
    const [categoryName, setCategoryName] = useState('News');
    const [updates, setUpdates] = useState<LiveUpdate[]>([]);
    const [loading, setLoading] = useState(true);

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
                        users ( id, full_name, username )
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

    if (loading) return <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}><LoadingSpinner /></div>;
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
            <header className="article-header" style={{ marginBottom: '3rem', textAlign: 'right', direction: 'rtl', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div style={{ color: 'var(--color-accent)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ● {categoryName}
                </div>
                <h1 className="article-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.1, marginBottom: '2rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#1A1A1A' }}>
                    {article.title}
                </h1>
                <p className="article-subdeck" style={{ fontSize: '1.25rem', lineHeight: 1.6, color: '#666', marginBottom: '2rem' }}>
                    {article.subdeck}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '1.25rem 0' }}>
                    {authorName && (
                        <>
                            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#333' }}>
                                قلمڪار <span style={{ color: 'var(--color-accent)' }}>
                                    {authorUsername ? (
                                        <Link to={`/author/${authorUsername}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {authorName}
                                        </Link>
                                    ) : authorName}
                                </span>
                            </div>
                            <span style={{ color: '#eee' }}>|</span>
                        </>
                    )}
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                        {formatSindhiDate(article.published_at || article.created_at)}
                    </div>
                </div>
            </header>

            {/* Featured Image */}
            {article.featured_image_url && (
                <div style={{ marginBottom: '1rem', width: '100%', maxWidth: '1080px', margin: '0 auto 1rem auto' }}>
                    <SafeImage
                        src={article.featured_image_url}
                        alt={article.title}
                        fetchPriority="high"
                        width="1200"
                        height="675"
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '4px' }}
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
