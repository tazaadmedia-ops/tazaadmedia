import React, { useState, useEffect, useRef } from 'react'; // Vercel cache clear
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
// import Image from '@tiptap/extension-image'; // Replaced by Figure
import Link from '@tiptap/extension-link';
import { Figure } from '../../extensions/Figure';
import { RelatedArticle } from '../../extensions/RelatedArticle';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import {
    Plus, X, MoreHorizontal, Image as ImageIcon, List,
    RotateCcw, RotateCw, Bold, Italic, Strikethrough,
    Code, Link as LinkIcon, Video, Quote,
    ListOrdered, ChevronDown, AlignLeft, AlignCenter, AlignRight,
    Loader, Check
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

// --- Components ---

const ToolbarButton = ({ onClick, icon, isActive, disabled, tooltip }: any) => (
    <button
        onClick={onClick}
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
    const [subdeck, setSubdeck] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);

    // Featured Image
    const [featuredImageUrl, setFeaturedImageUrl] = useState('');
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

    // File Input Refs
    const imageInputRef = useRef<HTMLInputElement>(null);
    const featuredImageInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Figure,
            RelatedArticle,
            Youtube.configure({ controls: true }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Start writing or press "/" for commands...' }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-lg focus:outline-none',
                style: 'min-height: 300px; padding-bottom: 5rem; font-family: var(--font-main); direction: rtl;',
            },
        },
    });

    // --- Utilities ---
    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w\u0600-\u06FF-]+/g, '') // Keep alphanumeric, Sindhi/Arabic chars and -
            .replace(/--+/g, '-')      // Replace multiple - with single -
            .substring(0, 100);        // Limit length
    };

    const isSlugUnique = async (testSlug: string, articleId?: string) => {
        let query = supabase.from('articles').select('id').eq('slug', testSlug);
        if (articleId && articleId !== 'new') {
            query = query.neq('id', articleId);
        }
        const { data, error } = await query.maybeSingle();
        if (error) return true; // Assume unique on error to let DB handle it, or handle specifically
        return !data;
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);

            // 1. Fetch authors and categories
            const { data: users } = await supabase.from('users').select('*');
            if (users) setAllAuthors(users);

            const { data: cats } = await supabase.from('categories').select('*');
            if (cats) setCategories(cats);

            // 2. If editing, fetch article data
            if (id && id !== 'new') {
                const { data: article } = await supabase
                    .from('articles')
                    .select(`
                        *,
                        article_authors (
                            users (*)
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (article) {
                    setTitle(article.title);
                    setSlug(article.slug || '');
                    setSubdeck(article.subdeck || '');
                    setCategoryId(article.primary_category_id);
                    setFeaturedImageUrl(article.featured_image_url || ''); // Assuming we add this column

                    if (article.article_authors) {
                        const authors = article.article_authors.map((aa: any) => aa.users).filter(Boolean);
                        setSelectedAuthors(authors);
                    }

                    editor?.commands.setContent(article.content_json || article.content_text || '');
                }
            }
            setIsLoading(false);
        };

        if (editor) init();
    }, [id, editor]);

    const handleSave = async () => {
        if (!title.trim()) return alert('Please enter a title');
        if (!editor) return;

        setIsSaving(true);

        // Use existing slug or generate new one from title if empty
        let finalSlug = slug.trim();
        if (!finalSlug) {
            finalSlug = slugify(title);
            // If title is empty or non-latin/sindhi, fallback to random
            if (!finalSlug) finalSlug = Math.random().toString(36).substring(2, 10);
        }

        // Pre-save uniqueness check
        const unique = await isSlugUnique(finalSlug, id);
        if (!unique) {
            setIsSaving(false);
            if (confirm('هن عنوان سان لنڪ پهريان ئي موجود آهي. ڇا نئين لنڪ تيار ڪجي؟ (Link already exists. Generate a new one?)')) {
                const randomPart = Math.random().toString(36).substring(2, 6);
                setSlug(finalSlug + '-' + randomPart);
            }
            return;
        }

        const payload: any = {
            title,
            subdeck,
            primary_category_id: categoryId,
            featured_image_url: featuredImageUrl,
            slug: finalSlug,
            content_json: editor.getJSON(),
            content_text: editor.getText(),
            status: 'published',
            updated_at: new Date().toISOString()
        };

        let articleId = id;

        if (id && id !== 'new') {
            payload.id = id;
            const { error } = await supabase.from('articles').update(payload).eq('id', id);
            if (error) { alert('بچائڻ ۾ غلطي (Error saving): ' + error.message); setIsSaving(false); return; }
        } else {
            const { data, error } = await supabase.from('articles').insert([payload]).select().single();
            if (error) { alert('تخليق ۾ غلطي (Error creating): ' + error.message); setIsSaving(false); return; }
            if (data) {
                articleId = data.id;
            }
        }

        if (articleId) {
            await supabase.from('article_authors').delete().eq('article_id', articleId);

            if (selectedAuthors.length > 0) {
                const authorInserts = selectedAuthors.map(a => ({
                    article_id: articleId,
                    author_id: a.id
                }));
                const { error: authError } = await supabase.from('article_authors').insert(authorInserts);
                if (authError) console.error('Error saving authors:', authError);
            }

            if (id === 'new') navigate(`/admin/edit/${articleId}`);
            else alert('Saved successfully!');
        }

        setIsSaving(false);
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

    const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editor) {
            const url = URL.createObjectURL(file);
            editor.commands.setImage({ src: url });
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

                {/* Top Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>

                    {/* Breadcrumbs / Category Selector */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#888', fontSize: '0.9rem', fontWeight: 500 }}>
                        <span>Drafts</span>
                        <span style={{ color: '#ccc' }}>/</span>

                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                                style={{
                                    cursor: 'pointer', color: categoryId ? '#000' : '#888',
                                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                {categories.find(c => c.id === categoryId)?.name || 'Select Category'}
                                <ChevronDown size={14} color="#999" />
                            </div>

                            {showCategoryMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: -10, marginTop: '8px',
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
                        <span style={{ color: '#000', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {title || 'Untitled'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                            <MoreHorizontal size={20} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                backgroundColor: '#000', color: '#fff', border: 'none',
                                padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', opacity: isSaving ? 0.7 : 1,
                                fontSize: '0.9rem'
                            }}>
                            {isSaving && <Loader size={14} className="animate-spin" />}
                            {isSaving ? 'Saving' : 'Publish'}
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
                            <ImageIcon size={18} /> Add Cover Image
                        </div>
                    )}
                    {featuredImageUrl && !isUploadingFeatured && (
                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                            Change Cover
                        </div>
                    )}
                </div>

                {/* Title & Deck */}
                <input
                    type="text"
                    placeholder="Article Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                        width: '100%', fontSize: '2.5rem', fontWeight: 800, border: 'none', outline: 'none',
                        marginBottom: '1rem', background: 'transparent', color: '#111', lineHeight: '1.2', direction: 'rtl'
                    }}
                />

                {/* Slug Editor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', direction: 'ltr' }}>
                    <span style={{ fontSize: '0.9rem', color: '#999', fontWeight: 600 }}>Slug:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f9f9f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #eee' }}>
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', color: '#555', fontFamily: 'monospace', width: '200px' }}
                        />
                        <button
                            onClick={() => {
                                if (confirm('لنڪ ٻيهر تيار ڪجي؟ (Regenerate slug?)')) {
                                    const base = slugify(title) || 'article';
                                    const random = Math.random().toString(36).substring(2, 6);
                                    setSlug(base + '-' + random);
                                }
                            }}
                            title="Regenerate Slug"
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#888' }}
                        >
                            <RotateCw size={14} />
                        </button>
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Add a short intro..."
                    value={subdeck}
                    onChange={(e) => setSubdeck(e.target.value)}
                    style={{
                        width: '100%', fontSize: '1.25rem', color: '#666', border: 'none', outline: 'none',
                        marginBottom: '2rem', background: 'transparent', lineHeight: '1.5', direction: 'rtl'
                    }}
                />

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

                {/* Toolbar */}
                <div style={{ position: 'sticky', top: '20px', zIndex: 50, marginBottom: '2rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', padding: '4px',
                        backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: 'fit-content'
                    }}>

                        {/* Undo/Redo */}
                        <div style={{ display: 'flex', gap: '2px', padding: '0 4px' }}>
                            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon={<RotateCcw size={16} />} />
                            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon={<RotateCw size={16} />} />
                        </div>

                        <ToolbarDivider />

                        {/* Style Dropdown Mock */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowStyleMenu(!showStyleMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    fontSize: '0.9rem', fontWeight: 500, color: '#333'
                                }}>
                                Style <ChevronDown size={14} color="#888" />
                            </button>
                            {showStyleMenu && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, marginTop: '8px',
                                    backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '6px', minWidth: '160px'
                                }}>
                                    {[
                                        { label: 'Normal Text', action: () => editor.chain().focus().setParagraph().run() },
                                        { label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
                                        { label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
                                        { label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
                                    ].map((opt, i) => (
                                        <div
                                            key={i}
                                            onClick={() => { opt.action(); setShowStyleMenu(false); }}
                                            style={{ padding: '8px 12px', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '4px' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
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
