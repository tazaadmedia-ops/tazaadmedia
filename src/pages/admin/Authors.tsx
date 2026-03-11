import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Plus, X, Search, Upload, User as UserIcon, Loader } from 'lucide-react';

interface Author {
    id: string;
    full_name: string;
    username: string;
    email: string;
    bio: string;
    avatar_url: string;
    role: string;
    is_hidden?: boolean;
    password?: string;
    social_links: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
        website?: string;
    };
}

const Authors: React.FC = () => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Author>>({ role: 'author' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setAuthors(data);
        if (error) console.error('Error fetching authors:', error);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!formData.full_name || !formData.email || !formData.username) {
            alert('Name, Username, and Email are required');
            return;
        }
        
        if (!formData.id && !formData.password) {
            alert('Password is required for new authors');
            return;
        }
        
        setIsSaving(true);

        const payload = { ...formData, updated_at: new Date().toISOString() };
        const rawPassword = payload.password;
        delete payload.password; // Do not send password to public users table

        if (formData.id) {
            // Update
            const { error } = await supabase.from('users').update(payload).eq('id', formData.id);
            if (error) alert(error.message);
        } else {
            // Insert - Call Vercel serverless function to create user via Service Role Key
            try {
                const response = await fetch('/api/create-author', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: payload.email,
                        password: rawPassword
                    }),
                });

                const apiData = await response.json();

                if (!response.ok || !apiData.user) {
                    alert('Error creating author account: ' + (apiData.error || 'Unknown error'));
                    setIsSaving(false);
                    return;
                }

                // Link the public.users record to the newly created auth ID
                payload.id = apiData.user.id;
            } catch (err: any) {
                alert('Request failed: ' + err.message);
                setIsSaving(false);
                return;
            }

            // Give it a brief moment to allow any backend triggers to finish (if Supabase has auto public.users triggers)
            // Just in case, we do an UPSERT (insert with onConflict) if there's a trigger, or standard insert if not.
            const { error } = await supabase.from('users').upsert([payload]);
            if (error) alert('Account created but error saving profile details: ' + error.message);
        }

        setIsSaving(false);
        setShowModal(false);
        setFormData({ role: 'author' });
        fetchAuthors();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`ڇا توھان پڪ سان ھن ليکڪ کي ختم ڪرڻ چاھيو ٿا؟\n"${name}"\n(Are you sure you want to delete this author?)`)) return;

        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            fetchAuthors();
            setShowModal(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData({ ...formData, avatar_url: publicUrl });
        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredAuthors = authors.filter(a =>
        a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div style={{ padding: '0 2rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>Authors & Team</h1>
                        <p style={{ color: '#666', marginTop: '0.25rem', fontSize: '0.9rem' }}>Manage editorial team and contributors.</p>
                    </div>
                    <button
                        onClick={() => { setFormData({ role: 'author' }); setShowModal(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: '#000', color: '#fff',
                            padding: '10px 16px', borderRadius: '8px',
                            fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                        }}>
                        <Plus size={18} /> Add Author
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '2rem', position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Search authors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 10px 10px 40px',
                            borderRadius: '8px', border: '1px solid #e0e0e0',
                            fontSize: '0.95rem', outline: 'none'
                        }}
                    />
                </div>

                {/* Grid */}
                {loading ? <p>Loading team...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {filteredAuthors.map(author => (
                            <div key={author.id} style={{
                                backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px',
                                padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
                                textAlign: 'center', transition: 'box-shadow 0.2s', cursor: 'pointer'
                            }}
                                onClick={() => { setFormData(author); setShowModal(true); }}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    backgroundColor: '#f5f5f5', marginBottom: '1rem',
                                    backgroundImage: `url(${author.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {!author.avatar_url && <UserIcon size={32} color="#ccc" />}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#222', marginBottom: '4px' }}>{author.full_name || 'Unnamed'}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#888' }}>{author.role}</p>
                                    {author.is_hidden && (
                                        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Hidden</span>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {author.bio || 'No bio available.'}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{
                            backgroundColor: '#fff', width: '100%', maxWidth: '500px', borderRadius: '16px',
                            padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                            position: 'relative', margin: '1rem'
                        }}>
                            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#666" />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                                {formData.id ? 'Edit Author' : 'Add New Author'}
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Avatar Upload */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            backgroundColor: '#f5f5f5', cursor: 'pointer', border: '2px dashed #ddd',
                                            backgroundImage: `url(${formData.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            position: 'relative', overflow: 'hidden'
                                        }}>
                                        {isUploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader className="animate-spin" size={20} /></div>}
                                        {!formData.avatar_url && !isUploading && <Upload size={24} color="#999" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Profile Photo</p>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Click to upload a new avatar</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#555' }}>Full Name *</label>
                                        <input
                                            placeholder="John Doe"
                                            value={formData.full_name || ''}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#555' }}>Username *</label>
                                        <input
                                            placeholder="johndoe"
                                            value={formData.username || ''}
                                            onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#555' }}>Email Address *</label>
                                    <input
                                        placeholder="john@example.com"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                                    />
                                </div>

                                {!formData.id && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#555' }}>Login Password *</label>
                                        <input
                                            placeholder="Secure password for this author"
                                            type="password"
                                            value={formData.password || ''}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: '#555' }}>Bio</label>
                                    <textarea
                                        placeholder="Short Bio..."
                                        rows={3}
                                        value={formData.bio || ''}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', fontFamily: 'inherit' }}
                                    />
                                </div>

                                {/* Social Links */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: '#555' }}>Social Links</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <input
                                            placeholder="Twitter URL"
                                            value={formData.social_links?.twitter || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                social_links: { ...formData.social_links, twitter: e.target.value }
                                            })}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #eee', fontSize: '0.9rem' }}
                                        />
                                        <input
                                            placeholder="Facebook URL"
                                            value={formData.social_links?.facebook || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                social_links: { ...formData.social_links, facebook: e.target.value }
                                            })}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #eee', fontSize: '0.9rem' }}
                                        />
                                        <input
                                            placeholder="Instagram URL"
                                            value={formData.social_links?.instagram || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                social_links: { ...formData.social_links, instagram: e.target.value }
                                            })}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #eee', fontSize: '0.9rem' }}
                                        />
                                        <input
                                            placeholder="Website URL"
                                            value={formData.social_links?.website || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                social_links: { ...formData.social_links, website: e.target.value }
                                            })}
                                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #eee', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="is_hidden"
                                        checked={formData.is_hidden || false}
                                        onChange={e => setFormData({ ...formData, is_hidden: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="is_hidden" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#555', cursor: 'pointer' }}>
                                        Hide this author from public site
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || isUploading}
                                        style={{
                                            flex: 1, padding: '14px', borderRadius: '8px',
                                            backgroundColor: '#000', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer',
                                            opacity: (isSaving || isUploading) ? 0.7 : 1
                                        }}>
                                        {isSaving ? 'Saving...' : 'Save Author'}
                                    </button>

                                    {formData.id && (
                                        <button
                                            onClick={() => handleDelete(formData.id!, formData.full_name!)}
                                            style={{
                                                padding: '14px', borderRadius: '8px',
                                                backgroundColor: '#fff', color: '#ef4444', fontWeight: 600,
                                                border: '1px solid #fee2e2', cursor: 'pointer'
                                            }}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Authors;
