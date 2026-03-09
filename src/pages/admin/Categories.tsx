import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Plus, X, Search, Edit2, Folder } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    is_visible_on_navbar: boolean;
    is_visible_on_home: boolean;
    display_order: number;
    count?: number; // Optional, strict for now
}

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Category>>({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (data) setCategories(data);
        if (error) console.error('Error fetching categories:', error);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            alert('Name and Slug are required');
            return;
        }
        setIsSaving(true);

        const payload = { ...formData };
        delete payload.count; // Don't send count if present

        if (formData.id) {
            // Update
            const { error } = await supabase.from('categories').update(payload).eq('id', formData.id);
            if (error) alert(error.message);
        } else {
            // Insert
            const { error } = await supabase.from('categories').insert([payload]);
            if (error) alert(error.message);
        }

        setIsSaving(false);
        setShowModal(false);
        setFormData({
            is_visible_on_navbar: true,
            is_visible_on_home: true,
            display_order: 0
        });
        fetchCategories();
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div style={{ padding: '0 2rem' }}>

                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>Categories</h1>
                        <p style={{ color: '#666', marginTop: '0.25rem', fontSize: '0.9rem' }}>Organize your content into topics.</p>
                    </div>
                    <button
                        onClick={() => { setFormData({}); setShowModal(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: '#000', color: '#fff',
                            padding: '10px 16px', borderRadius: '8px',
                            fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                        }}>
                        <Plus size={18} /> Add Category
                    </button>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '2rem', position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 10px 10px 40px',
                            borderRadius: '8px', border: '1px solid #e0e0e0',
                            fontSize: '0.95rem', outline: 'none'
                        }}
                    />
                </div>

                {/* List */}
                {/* List Container */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        {loading ? <p style={{ padding: '2rem' }}>Loading...</p> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                    <tr>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', width: '30%' }}>Name</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Slug</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Navbar</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Home</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666' }}>Order</th>
                                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#666', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map(cat => (
                                        <tr key={cat.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Folder size={18} color="#999" /> {cat.name}
                                            </td>
                                            <td style={{ padding: '1.2rem 1.5rem', fontFamily: 'monospace', color: '#666', fontSize: '0.9rem' }}>/{cat.slug}</td>
                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                <span style={{ color: cat.is_visible_on_navbar ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                    {cat.is_visible_on_navbar ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.5rem' }}>
                                                <span style={{ color: cat.is_visible_on_home ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                    {cat.is_visible_on_home ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>{cat.display_order}</td>
                                            <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => { setFormData(cat); setShowModal(true); }}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}>
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCategories.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>No categories found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{
                            backgroundColor: '#fff', width: '100%', maxWidth: '450px', borderRadius: '16px',
                            padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                            position: 'relative', margin: '1rem'
                        }}>
                            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#666" />
                            </button>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                                {formData.id ? 'Edit Category' : 'New Category'}
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Name</label>
                                    <input
                                        placeholder="e.g. Politics"
                                        value={formData.name || ''}
                                        onChange={e => {
                                            const name = e.target.value;
                                            setFormData(prev => ({ ...prev, name, slug: !prev.id ? generateSlug(name) : prev.slug }));
                                        }}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Slug</label>
                                    <input
                                        placeholder="politics"
                                        value={formData.slug || ''}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'monospace', backgroundColor: '#f9f9f9' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Description (Optional)</label>
                                    <textarea
                                        placeholder="Short description..."
                                        rows={2}
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Display Order</label>
                                        <input
                                            type="number"
                                            value={formData.display_order ?? 0}
                                            onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_visible_on_navbar ?? true}
                                            onChange={e => setFormData({ ...formData, is_visible_on_navbar: e.target.checked })}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Show on Navbar
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_visible_on_home ?? true}
                                            onChange={e => setFormData({ ...formData, is_visible_on_home: e.target.checked })}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Show on Homepage
                                    </label>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{
                                        marginTop: '1rem', padding: '14px', borderRadius: '8px',
                                        backgroundColor: '#000', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer',
                                        opacity: isSaving ? 0.7 : 1
                                    }}>
                                    {isSaving ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default Categories;
