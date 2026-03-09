import React, { useState, useEffect, useRef } from 'react'; // Vercel cache clear
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
// @ts-ignore
import { FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
// import Image from '@tiptap/extension-image'; // Replaced by Figure
import Link from '@tiptap/extension-link';
import { Figure } from '../../extensions/Figure';
import { RelatedArticle } from '../../extensions/RelatedArticle';
import { Twitter as TwitterExtension } from '../../extensions/Twitter';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import {
    Plus, X, MoreHorizontal, Image as ImageIcon, List,
    RotateCcw, RotateCw, Bold, Italic, Strikethrough,
    Code, Link as LinkIcon, Video, Quote,
    ListOrdered, ChevronDown, AlignLeft, AlignCenter, AlignRight,
    Loader, Check, Twitter as TwitterIcon
} from 'lucide-react';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminTimelineEditor from '../../components/admin/AdminTimelineEditor';
import { supabase } from '../../lib/supabase';

// --- Components ---

const ToolbarButton = ({ onClick, icon, isActive, disabled, tooltip }: any) => (
    <button
        type="button"
        onMouseDown={(e) => {
            e.preventDefault();
            if (!disabled) onClick();
        }}
        disabled={disabled}
        title={tooltip}
        style={{
            padding: '6px',
            color: isActive ? '#000' : '#888',
            backgroundColor: isActive ? '#f3f4f6' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.1s ease',
            minWidth: '28px',
            minHeight: '28px'
        }}
        onMouseEnter={(e) => !disabled && !isActive && (e.currentTarget.style.color = '#333')}
        onMouseLeave={(e) => !disabled && !isActive && (e.currentTarget.style.color = '#888')}
    >
        {icon}
    </button>
);

const ToolbarDivider = () => (
    <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0', margin: '0 8px' }} />
);

const ArticleEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Core Data
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    // const [initialSlug, setInitialSlug] = useState(''); // Removed pre-check

    const [subdeck, setSubdeck] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [publishedAt, setPublishedAt] = useState<string | null>(null);
    const [hasUpdates, setHasUpdates] = useState(false);

    // Featured Image
    const [featuredImageUrl, setFeaturedImageUrl] = useState('');
    const [featuredImageCaption, setFeaturedImageCaption] = useState('');
    const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);

    // Authors Data
    const [allAuthors, setAllAuthors] = useState<any[]>([]);
    const [selectedAuthors, setSelectedAuthors] = useState<any[]>([]);
    const [showAuthorInput, setShowAuthorInput] = useState(false);
    const [authorSearch, setAuthorSearch] = useState('');

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showStyleMenu, setShowStyleMenu] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    const [articleSearchQuery, setArticleSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchingArticles, setIsSearchingArticles] = useState(false);

    // File Input Refs
    const imageInputRef = useRef<HTMLInputElement>(null);
    const featuredImageInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable link if it's included in this version's StarterKit
                // @ts-ignore - version specific
                link: false,
            }),
            Figure,
            RelatedArticle,
            TwitterExtension,
            Youtube.configure({ controls: true }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Start writing or press "/" for commands...' }),
            FloatingMenuExtension,
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-lg focus:outline-none',
                style: 'min-height: 300px; padding-bottom: 5rem; font-family: var(--font-main); direction: rtl;',
            },
            handlePaste: (view, event, _slice) => {
                const item = Array.from(event.clipboardData?.items || []).find(x => x.type.startsWith('image'));
                if (item) {
                    event.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        handleImagePasteDrop(view, file);
                    }
                    return true;
                }
                return false;
            },
            handleDrop: (view, event, _slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image')) {
                        event.preventDefault();
                        handleImagePasteDrop(view, file);
                        return true;
                    }
                }
                return false;
            }
        },
    });

    const handleImagePasteDrop = async (view: any, file: File) => {
        // Optimistic UI could go here (placeholder)

        try {
            const fileExt = file.name.split('.').pop() || 'png';
            const fileName = `paste_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { schema } = view.state;
            const node = schema.nodes.figure.create({ src: publicUrl });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);

        } catch (error: any) {
            console.error('Error handling image paste/drop:', error);
            alert('Failed to upload image: ' + error.message);
        }
    };

    // --- Utilities ---
    const generateRandomSlug = (length = 12) => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };





    useEffect(() => {
        const init = async () => {
            try {
                // 1. Fetch authors and categories
                const { data: users } = await supabase.from('users').select('*');
                if (users) setAllAuthors(users);

                const { data: cats } = await supabase.from('categories').select('*');
                if (cats) setCategories(cats);

                // 2. If editing, fetch article data
                if (id && id !== 'new') {
                    const { data: article, error } = await supabase
                        .from('articles')
                        .select(`
                        *,
                        article_authors (
                            users (*)
                        )
                    `)
                        .eq('id', id)
                        .single();

                    if (error) throw error;

                    if (article) {
                        setTitle(article.title);
                        setSlug(article.slug || '');
                        // setInitialSlug(article.slug || '');
                        setSubdeck(article.subdeck || '');
                        setCategoryId(article.primary_category_id);
                        setFeaturedImageUrl(article.featured_image_url || ''); // Assuming we add this column
                        setFeaturedImageCaption(article.featured_image_caption || '');
                        setIsLive(article.is_live || false);
                        setIsPinned(article.is_pinned || false);
                        setPublishedAt(article.published_at);

                        if (article.article_authors) {
                            const authors = article.article_authors.map((aa: any) => aa.users).filter(Boolean);
                            setSelectedAuthors(authors);
                        }

                        editor?.commands.setContent(article.content_json || article.content_text || '');

                        // 3. Check for existing updates
                        const { count } = await supabase
                            .from('live_updates')
                            .select('*', { count: 'exact', head: true })
                            .eq('article_id', id);

                        if (count && count > 0) {
                            setHasUpdates(true);
                        }
                    }
                }
            } catch (error: any) {
                console.error('Error loading editor data:', error);
                alert('Error loading data: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (editor) init();
    }, [id, editor]);

    const handleSave = async () => {
        if (!title.trim()) return alert('Please enter a title');
        if (!editor) return;

        setIsSaving(true);

        let currentSlug = slug.trim();
        // Only generate a new slug if it's completely empty
        if (!currentSlug) {
            currentSlug = generateRandomSlug();
            setSlug(currentSlug);
        }

        const basePayload: any = {
            title,
            subdeck,
            primary_category_id: categoryId,
            featured_image_url: featuredImageUrl,
            featured_image_caption: featuredImageCaption,
            content_json: editor.getJSON(),
            content_text: editor.getText(),
            status: 'published',
            is_live: isLive,
            is_pinned: isPinned,
            updated_at: new Date().toISOString(),
            published_at: publishedAt || new Date().toISOString()
        };

        // Update state if we just set it
        if (!publishedAt) {
            setPublishedAt(basePayload.published_at);
        }

        // Recursive save helper to handle duplications
        const saveToDb = async (slugToTry: string, retries = 0): Promise<{ id: string, finalSlug: string }> => {
            const payload: any = { ...basePayload, slug: slugToTry };

            // If updating, include ID in payload just in case, though .update().eq() handles it
            if (id && id !== 'new') {
                payload.id = id;
            }

            let errorSg = null;
            let dataSg = null;

            if (id && id !== 'new') {
                const { error } = await supabase.from('articles').update(payload).eq('id', id);
                errorSg = error;
            } else {
                const { data, error } = await supabase.from('articles').insert([payload]).select().single();
                errorSg = error;
                dataSg = data;
            }

            if (errorSg) {
                // Check for unique constraint violation (Postgres code 23505) or explicit slug message
                if ((errorSg.code === '23505' || errorSg.message.includes('slug') || errorSg.message.includes('unique')) && retries < 3) {
                    // Only retry with a new slug if it's a NEW article to avoid changing stable URLs
                    if (!id || id === 'new') {
                        const newSlug = `${slugToTry}-${Math.floor(Math.random() * 10000)}`;
                        console.warn(`Slug collision for ${slugToTry}, retrying with ${newSlug}`);
                        return saveToDb(newSlug, retries + 1);
                    }
                }
                throw errorSg;
            }

            return { id: id && id !== 'new' ? id : dataSg?.id, finalSlug: slugToTry };
        };

        try {
            const { id: savedId, finalSlug } = await saveToDb(currentSlug);

            // Update state if slug was auto-corrected
            if (finalSlug !== currentSlug) {
                setSlug(finalSlug);
                // setInitialSlug(finalSlug);
            } else {
                // setInitialSlug(finalSlug);
            }

            if (savedId) {
                await supabase.from('article_authors').delete().eq('article_id', savedId);

                if (selectedAuthors.length > 0) {
                    const authorInserts = selectedAuthors.map(a => ({
                        article_id: savedId,
                        author_id: a.id
                    }));
                    const { error: authError } = await supabase.from('article_authors').insert(authorInserts);
                    if (authError) console.error('Error saving authors:', authError);
                }

                if (!id || id === 'new') {
                    navigate(`/admin/edit/${savedId}`, { replace: true });
                } else {
                    alert('Saved successfully!' + (finalSlug !== currentSlug ? ` (Slug updated to ${finalSlug})` : ''));
                }
            }
        } catch (error: any) {
            console.error('Save failed:', error);
            alert('بچائڻ ۾ غلطي (Error saving): ' + (error.message || 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAuthor = (author: any) => {
        if (selectedAuthors.find(a => a.id === author.id)) {
            setSelectedAuthors(selectedAuthors.filter(a => a.id !== author.id));
        } else {
            setSelectedAuthors([...selectedAuthors, author]);
        }
        setShowAuthorInput(false);
        setAuthorSearch('');
    };

    const toggleHeadingWithSplit = (level: any) => {
        if (!editor) return;
        editor.chain().focus().toggleHeading({ level }).run();
    };

    const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editor) {
            try {
                // Show some loading state if possible? Or just wait.
                // Since this is triggered by file input, we can do optimistic update or just wait.

                const fileExt = file.name.split('.').pop();
                const fileName = `article_content_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars') // Shared bucket or create new 'content' bucket? Using avatars for simplicity as per featured image.
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                editor.commands.setFigure({ src: publicUrl });
            } catch (error: any) {
                console.error('Error uploading inline image:', error);
                alert('Error uploading image: ' + error.message);
            }
        }
    };

    const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingFeatured(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `featured_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars') // Using avatars bucket for now or create a 'media' bucket
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFeaturedImageUrl(publicUrl);
        } catch (error: any) {
            alert('Error uploading featured image: ' + error.message);
        } finally {
            setIsUploadingFeatured(false);
        }
    };

    const searchArticles = async (query: string) => {
        setIsSearchingArticles(true);
        try {
            // Sanitize query: remove commas and normalize spaces for .or() syntax
            const safeQuery = query.trim().replace(/[,()]/g, ' ');

            let request = supabase
                .from('articles')
                .select('id, title, featured_image_url, slug')
                .neq('id', id || '') // Don't link to self
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(6);

            if (safeQuery) {
                request = request.or(`title.ilike.%${safeQuery}%,slug.ilike.%${safeQuery}%`);
            }

            const { data, error } = await request;
            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching articles:', error);
        } finally {
            setIsSearchingArticles(false);
        }
    };

    const handleSelectRelatedArticle = (article: any) => {
        if (editor) {
            editor.commands.setRelatedArticle({
                id: article.id,
                title: article.title,
                image: article.featured_image_url || undefined,
                url: `/${article.slug}`
            });
            setIsLinkModalOpen(false);
            setArticleSearchQuery('');
            setSearchResults([]);
        }
    };



    if (!editor) return null;
    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Editor...</div>;

    const filteredAuthors = allAuthors.filter(u =>
        (u.full_name || '').toLowerCase().includes(authorSearch.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(authorSearch.toLowerCase())
    );

    return (
        <AdminLayout>
            <input type="file" ref={imageInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleEditorImageUpload} />
            <input type="file" ref={featuredImageInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFeaturedImageUpload} />

            <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>

                {/* Native Floating Menu */}
                {editor && (
                    <FloatingMenu
                        editor={editor}
                        shouldShow={({ state }) => {
                            // Only show if it's an empty paragraph
                            return state.selection.$from.parent.type.name === 'paragraph' && state.selection.$from.parent.content.size === 0;
                        }}
                        options={{ offset: 10, placement: 'right' }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#fff',
                            padding: '6px',
                            borderRadius: '30px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            border: '1px solid #eee',
                        }}>
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setIsFloatingMenuOpen(!isFloatingMenuOpen);
                                }}
                                title="Add Section"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    border: 'none', backgroundColor: isFloatingMenuOpen ? '#B70100' : '#000',
                                    cursor: 'pointer', color: '#fff',
                                    transition: 'all 0.2s',
                                    transform: isFloatingMenuOpen ? 'rotate(45deg)' : 'none'
                                }}
                            >
                                <Plus size={18} />
                            </button>

                            {isFloatingMenuOpen && (
                                <div style={{
                                    display: 'flex',
                                    gap: '2px',
                                    animation: 'fade-in 0.2s ease-out'
                                }}>
                                    <button
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            imageInputRef.current?.click();
                                            setIsFloatingMenuOpen(false);
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '20px',
                                            border: 'none', backgroundColor: 'transparent',
                                            cursor: 'pointer', color: '#444', fontSize: '0.85rem', fontWeight: 600
                                        }}
                                    >
                                        <ImageIcon size={16} /> تصوير
                                    </button>
                                    <div style={{ width: '1px', height: '16px', backgroundColor: '#eee', alignSelf: 'center' }} />
                                    <button
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setIsLinkModalOpen(true);
                                            setIsFloatingMenuOpen(false);
                                            // Trigger initial search for recent articles
                                            searchArticles('');
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '20px',
                                            border: 'none', backgroundColor: 'transparent',
                                            cursor: 'pointer', color: '#444', fontSize: '0.85rem', fontWeight: 600
                                        }}
                                    >
                                        <List size={16} /> پراڻا مضمون
                                    </button>
                                    <div style={{ width: '1px', height: '16px', backgroundColor: '#eee', alignSelf: 'center' }} />
                                    <button
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            const url = window.prompt('Twitter/X لنڪ پيسٽ ڪريو:');
                                            if (url && editor) {
                                                editor.commands.setTwitter({ url });
                                            }
                                            setIsFloatingMenuOpen(false);
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '6px 12px', borderRadius: '20px',
                                            border: 'none', backgroundColor: 'transparent',
                                            cursor: 'pointer', color: '#444', fontSize: '0.85rem', fontWeight: 600
                                        }}
                                    >
                                        <TwitterIcon size={16} /> ٽوئيٽ
                                    </button>
                                </div>
                            )}
                        </div>
                    </FloatingMenu>
                )}

                {/* Article Search Modal */}
                {isLinkModalOpen && (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        backdropFilter: 'blur(2px)'
                    }}>
                        <div style={{
                            backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)', overflow: 'hidden', direction: 'rtl'
                        }}>
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>مضمون کي لنڪ ڪريو (Link Article)</h3>
                                <button onClick={() => setIsLinkModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                    <input
                                        type="text"
                                        placeholder="مضمون جو عنوان ڳولھيو..."
                                        value={articleSearchQuery}
                                        onChange={(e) => {
                                            setArticleSearchQuery(e.target.value);
                                            searchArticles(e.target.value);
                                        }}
                                        autoFocus
                                        style={{
                                            width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #ddd',
                                            fontSize: '1rem', outline: 'none', fontFamily: 'var(--font-main)'
                                        }}
                                    />
                                    {isSearchingArticles && <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}><Loader size={16} className="animate-spin text-gray-400" /></div>}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {searchResults.length > 0 ? (
                                        searchResults.map(art => (
                                            <div
                                                key={art.id}
                                                onClick={() => handleSelectRelatedArticle(art)}
                                                style={{
                                                    padding: '10px', borderRadius: '8px', border: '1px solid #eee',
                                                    cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center',
                                                    transition: 'all 0.2s', backgroundColor: '#f9fafb'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B70100'; e.currentTarget.style.backgroundColor = '#fff'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                                            >
                                                {art.featured_image_url ? (
                                                    <img src={art.featured_image_url} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                ) : (
                                                    <div style={{ width: '50px', height: '40px', backgroundColor: '#eee', borderRadius: '4px' }} />
                                                )}
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111', flexGrow: 1 }}>{art.title}</div>
                                            </div>
                                        ))
                                    ) : articleSearchQuery.length > 2 ? (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: '#999' }}>ڪو به مضمون نه مليو.</div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Actions */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    gap: '1rem',
                    backgroundColor: '#fff',
                    padding: '0.5rem 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                                    backgroundColor: '#f3f4f6', borderRadius: '6px', border: '1px solid #e5e7eb',
                                    fontSize: '0.85rem', fontWeight: 600, color: '#374151', cursor: 'pointer'
                                }}>
                                {categoryId ? categories.find(c => c.id === categoryId)?.name : 'Select Topic'}
                                <ChevronDown size={14} />
                            </button>
                            {showCategoryMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                                    background: 'white', border: '1px solid #eee', borderRadius: '8px',
                                    padding: '6px', zIndex: 60, minWidth: '180px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', padding: '8px', textTransform: 'uppercase' }}>Category</div>
                                    {categories.map(c => (
                                        <div
                                            key={c.id}
                                            onClick={() => { setCategoryId(c.id); setShowCategoryMenu(false); }}
                                            style={{
                                                padding: '8px 10px', fontSize: '0.9rem', cursor: 'pointer',
                                                borderRadius: '6px', color: c.id === categoryId ? 'black' : '#555',
                                                fontWeight: c.id === categoryId ? 600 : 400,
                                                backgroundColor: c.id === categoryId ? '#f9fafb' : 'transparent',
                                                display: 'flex', alignItems: 'center', gap: '8px'
                                            }}
                                            onMouseEnter={(e) => { if (c.id !== categoryId) e.currentTarget.style.backgroundColor = '#fafafa' }}
                                            onMouseLeave={(e) => { if (c.id !== categoryId) e.currentTarget.style.backgroundColor = 'transparent' }}
                                        >
                                            {c.id === categoryId && <Check size={14} />}
                                            {c.name}
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => navigate('/admin/categories')}
                                        style={{
                                            padding: '8px 10px', fontSize: '0.85rem', cursor: 'pointer', borderTop: '1px solid #eee',
                                            marginTop: '4px', color: 'var(--color-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                        <Plus size={14} /> Add New Category
                                    </div>
                                </div>
                            )}
                        </div>

                        <span style={{ color: '#ccc' }}>/</span>
                        <span style={{
                            color: '#000',
                            maxWidth: '150px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            {title || 'Untitled'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '8px' }}>
                            <MoreHorizontal size={20} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                backgroundColor: '#000', color: '#fff', border: 'none',
                                padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', opacity: isSaving ? 0.7 : 1,
                                fontSize: '0.9rem', whiteSpace: 'nowrap'
                            }}>
                            {isSaving && <Loader size={14} className="animate-spin" />}
                            {isSaving ? 'Saving' : (id && id !== 'new' ? 'Update' : 'Publish')}
                        </button>
                    </div>
                </div>

                {/* FEATURED IMAGE */}
                <div
                    onClick={() => featuredImageInputRef.current?.click()}
                    style={{
                        width: '100%', height: featuredImageUrl ? '300px' : '60px', borderRadius: '8px',
                        backgroundColor: featuredImageUrl ? '#fff' : '#f9f9f9',
                        border: featuredImageUrl ? 'none' : '1px dashed #ddd',
                        marginBottom: '2rem', cursor: 'pointer', position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        backgroundImage: featuredImageUrl ? `url(${featuredImageUrl})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        transition: 'height 0.3s ease'
                    }}>

                    {isUploadingFeatured && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader className="animate-spin" /></div>}

                    {!featuredImageUrl && !isUploadingFeatured && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999', fontSize: '0.9rem' }}>
                            <ImageIcon size={20} />
                            <span>Add Featured Image</span>
                        </div>
                    )}
                    {featuredImageUrl && !isUploadingFeatured && (
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                            Change Cover
                        </div>
                    )}
                </div>

                {/* Title & Deck */}
                <textarea
                    placeholder="Article Title"
                    value={title}
                    onChange={(e) => {
                        const newTitle = e.target.value;
                        setTitle(newTitle);
                        // Auto-generate random slug for new articles if slug is empty
                        if ((!id || id === 'new') && !slug && newTitle.trim().length > 0) {
                            setSlug(generateRandomSlug());
                        }

                        // Auto-resize
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    rows={1}
                    style={{
                        width: '100%', fontSize: '2.5rem', fontWeight: 900, border: 'none', outline: 'none',
                        marginBottom: '1rem', background: 'transparent', color: '#111', lineHeight: '1.2',
                        direction: 'rtl', fontFamily: 'var(--font-main)', resize: 'none', overflow: 'hidden'
                    }}
                />

                {/* Slug Editor */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', direction: 'ltr' }}>
                    <span style={{ fontSize: '0.9rem', color: '#999', fontWeight: 600 }}>Slug:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f9f9f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #eee', maxWidth: '100%' }}>
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '15px', color: '#555', fontFamily: 'monospace', width: '100%', minWidth: '150px' }}
                        />
                        <button
                            onClick={() => {
                                if (confirm('لنڪ ٻيهر تيار ڪجي؟ (Regenerate slug?)')) {
                                    setSlug(generateRandomSlug());
                                }
                            }}
                            title="Regenerate Slug"
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#888', flexShrink: 0 }}
                        >
                            <RotateCw size={14} />
                        </button>
                    </div>
                </div>

                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <textarea
                        placeholder="Add a short intro..."
                        value={subdeck}
                        maxLength={250}
                        onChange={(e) => {
                            setSubdeck(e.target.value);
                            // Auto-resize
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onFocus={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        rows={1}
                        style={{
                            width: '100%', fontSize: '1.25rem', color: '#666', border: 'none', outline: 'none',
                            background: 'transparent', lineHeight: '1.5', direction: 'rtl',
                            paddingBottom: '4px', fontFamily: 'var(--font-main)', resize: 'none', overflow: 'hidden'
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '0',
                        fontSize: '0.75rem',
                        color: subdeck.length >= 250 ? 'red' : '#ccc',
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {subdeck.length}/250
                    </div>
                </div>

                {/* Live Blog Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', marginBottom: '2.5rem', direction: 'rtl', backgroundColor: isLive ? '#fef2f2' : '#f9fafb', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${isLive ? '#fecaca' : '#e5e7eb'}`, transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: isLive ? '#dc2626' : '#374151', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            لائيو اپڊيٽس
                            {isLive && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (window.confirm('Are you sure you want to end this live blog?')) {
                                            setIsLive(false);
                                        }
                                    }}
                                    style={{
                                        fontSize: '0.8rem',
                                        padding: '4px 12px',
                                        backgroundColor: '#dc2626',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    لائيو ختم ڪريو
                                </button>
                            )}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                            هن مضمون کي لائيو بلاگ طور سيٽ ڪريو
                        </span>
                    </div>

                    {/* Switch styled checkbox */}
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', marginRight: 'auto' }}>
                        <input
                            type="checkbox"
                            checked={isLive}
                            onChange={(e) => setIsLive(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: isLive ? '#ef4444' : '#ccc', transition: '.4s', borderRadius: '24px'
                        }}>
                            <span style={{
                                position: 'absolute', height: '18px', width: '18px', left: isLive ? '22px' : '3px', bottom: '3px',
                                backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                </div>

                {/* Pinned toggle */}
                <div style={{
                    padding: '2rem', backgroundColor: '#fff', borderRadius: '12px',
                    border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', marginBottom: '2.5rem'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            مضمون کي پن ڪريو
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                            هن مضمون کي هوم پيج جي مين ڪارڊ تي پن ڪريو
                        </span>
                    </div>

                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', marginRight: 'auto' }}>
                        <input
                            type="checkbox"
                            checked={isPinned}
                            onChange={(e) => setIsPinned(e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: isPinned ? 'var(--color-accent)' : '#ccc', transition: '.4s', borderRadius: '24px'
                        }}>
                            <span style={{
                                position: 'absolute', height: '18px', width: '18px', left: isPinned ? '22px' : '3px', bottom: '3px',
                                backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                </div>

                {(isLive || hasUpdates) && id && id !== 'new' && (
                    <div style={{ marginBottom: '3rem' }}>
                        <AdminTimelineEditor articleId={id} isLive={isLive} />
                    </div>
                )}
                {isLive && (!id || id === 'new') && (
                    <div style={{ padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', marginBottom: '2.5rem', fontSize: '0.9rem', direction: 'rtl' }}>
                        لائيو اپڊيٽس تبديل يا شامل ڪرڻ لاءِ پھريان مضمون کي محفوظ (Publish/Save) ڪريو.
                    </div>
                )}

                {/* Bylines */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                    {selectedAuthors.map(a => (
                        <div key={a.id} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '4px 8px 4px 8px', backgroundColor: '#f3f4f6',
                            borderRadius: '20px', fontSize: '0.9rem', color: '#333', fontWeight: 500
                        }}>
                            {a.avatar_url && <img src={a.avatar_url} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
                            {a.full_name}
                            <button onClick={() => toggleAuthor(a)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', padding: 0, marginLeft: '4px' }}>
                                <X size={14} color="#888" />
                            </button>
                        </div>
                    ))}

                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setShowAuthorInput(!showAuthorInput); setTimeout(() => document.getElementById('author-search')?.focus(), 10); }}
                            style={{
                                border: 'none', background: 'none', cursor: 'pointer', color: '#999',
                                display: 'flex', alignItems: 'center'
                            }}>
                            <Plus size={22} strokeWidth={1.5} />
                        </button>

                        {showAuthorInput && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, marginTop: '8px', width: '260px',
                                backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                border: '1px solid #f0f0f0', padding: '8px', zIndex: 60
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', padding: '8px 8px 4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add byline</div>

                                {/* Search Input */}
                                <div style={{ padding: '0 8px 8px 8px' }}>
                                    <input
                                        id="author-search"
                                        placeholder="Search authors..."
                                        value={authorSearch}
                                        onChange={(e) => setAuthorSearch(e.target.value)}
                                        style={{
                                            width: '100%', padding: '6px 8px', borderRadius: '6px',
                                            border: '1px solid #eee', fontSize: '16px', outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {filteredAuthors.map(user => {
                                        const isSelected = selectedAuthors.find(a => a.id === user.id);
                                        return (
                                            <div
                                                key={user.id}
                                                onClick={() => toggleAuthor(user)}
                                                style={{
                                                    padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    backgroundColor: isSelected ? '#f9fafb' : 'transparent'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                                onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#eee', backgroundImage: `url(${user.avatar_url})`, backgroundSize: 'cover' }} />
                                                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>{user.full_name || user.email}</span>
                                                {isSelected && <Check size={16} color="black" style={{ marginLeft: 'auto' }} />}
                                            </div>
                                        );
                                    })}
                                    {filteredAuthors.length === 0 && (
                                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#999' }}>No authors found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toolbar Container */}
                <div style={{
                    position: 'sticky',
                    top: '10px',
                    zIndex: 51,
                    marginBottom: '2rem',
                    maxWidth: '100%',
                    paddingBottom: '10px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '4px',
                        padding: '6px',
                        backgroundColor: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        width: '100%'
                    }}>
                        {/* Undo/Redo */}
                        <div style={{ display: 'flex', gap: '2px', padding: '0 4px' }}>
                            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={<RotateCcw size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={<RotateCw size={16} />} />
                        </div>

                        <ToolbarDivider />

                        {/* Style Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    setShowStyleMenu(!showStyleMenu);
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    fontSize: '0.85rem', fontWeight: 600, color: '#333', whiteSpace: 'nowrap'
                                }}>
                                {editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
                                    editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
                                        editor.isActive('heading', { level: 3 }) ? 'Heading 3' : 'Normal Text'}
                                <ChevronDown size={14} color="#888" />
                            </button>
                            {showStyleMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                                    backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '6px', minWidth: '160px', zIndex: 100
                                }}>
                                    {[
                                        { label: 'Normal Text', level: 0, action: () => editor.chain().focus().setParagraph().run() },
                                        { label: 'Heading 1', level: 1, action: () => toggleHeadingWithSplit(1) },
                                        { label: 'Heading 2', level: 2, action: () => toggleHeadingWithSplit(2) },
                                        { label: 'Heading 3', level: 3, action: () => toggleHeadingWithSplit(3) },
                                    ].map((opt, i) => {
                                        const isActive = opt.level === 0 ? editor.isActive('paragraph') : editor.isActive('heading', { level: opt.level });
                                        return (
                                            <div
                                                key={i}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    opt.action();
                                                    setShowStyleMenu(false);
                                                }}
                                                style={{
                                                    padding: '8px 12px',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                                                    fontWeight: isActive ? 600 : 400,
                                                    color: isActive ? '#000' : '#555'
                                                }}
                                                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                {opt.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <ToolbarDivider />

                        {/* Formatting */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} icon={<Strikethrough size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} icon={<Code size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} icon={<X size={16} />} tooltip="Clear Formatting" />
                        </div>

                        <ToolbarDivider />

                        {/* Media & Links */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                            <ToolbarButton onClick={() => {
                                const previousUrl = editor?.getAttributes('link').href;
                                const url = window.prompt('URL', previousUrl);
                                if (url === null) return;
                                if (url === '') { editor?.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
                                editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                            }} isActive={editor.isActive('link')} icon={<LinkIcon size={16} />} />
                            <ToolbarButton onClick={() => imageInputRef.current?.click()} icon={<ImageIcon size={16} />} />
                            <ToolbarButton onClick={() => {
                                const url = prompt('Enter YouTube URL');
                                if (url) editor.commands.setYoutubeVideo({ src: url });
                            }} icon={<Video size={16} />} />
                            <ToolbarButton onClick={() => {
                                const url = prompt('Enter Twitter/X URL');
                                if (url) editor.commands.setTwitter({ url });
                            }} icon={<TwitterIcon size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={<Quote size={16} />} />
                        </div>

                        <ToolbarDivider />

                        {/* Lists */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered size={16} />} />
                        </div>

                        <ToolbarDivider />

                        {/* Align */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={<AlignLeft size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={<AlignCenter size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={<AlignRight size={16} />} />
                        </div>
                    </div>
                </div>

                {/* Editor Area */}
                <div style={{ minHeight: '500px', fontSize: '1.1rem', lineHeight: '1.8' }}>
                    <EditorContent editor={editor} />
                </div>
            </div>
        </AdminLayout>
    );
};

export default ArticleEditor;
