import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Save, Settings as SettingsIcon } from 'lucide-react';

const SiteSettings: React.FC = () => {
    const [settings, setSettings] = useState<any>({
        show_about_in_navbar: true
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (data) {
            const settingsMap = data.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});
            setSettings({ ...settings, ...settingsMap });
        }
        if (error) console.error('Error fetching settings:', error);
        setLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);

        const updates = Object.entries(settings).map(([key, value]) => ({
            key,
            value,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('site_settings')
            .upsert(updates, { onConflict: 'key' });

        if (error) {
            alert('Error saving settings: ' + error.message);
        } else {
            alert('Settings saved successfully!');
        }

        setIsSaving(false);
    };

    return (
        <AdminLayout>
            <div style={{ padding: '0 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <SettingsIcon size={28} /> Site Settings
                        </h1>
                        <p style={{ color: '#666', marginTop: '0.25rem' }}>General website configuration.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: 'var(--color-accent)', color: '#fff',
                            padding: '10px 20px', borderRadius: '8px',
                            fontWeight: 700, border: 'none', cursor: 'pointer',
                            opacity: (isSaving || loading) ? 0.7 : 1
                        }}>
                        <Save size={18} /> {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                {loading ? <p>Loading settings...</p> : (
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '2rem', maxWidth: '600px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Navigation Menu</h3>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                    <div
                                        onClick={() => setSettings({ ...settings, show_about_in_navbar: !settings.show_about_in_navbar })}
                                        style={{
                                            width: '44px',
                                            height: '24px',
                                            backgroundColor: settings.show_about_in_navbar ? '#10b981' : '#e5e7eb',
                                            borderRadius: '24px',
                                            position: 'relative',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            backgroundColor: '#fff',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '3px',
                                            left: settings.show_about_in_navbar ? '23px' : '3px',
                                            transition: 'left 0.2s'
                                        }} />
                                    </div>
                                    <span style={{ fontWeight: 500 }}>Show "About" link in Navbar</span>
                                </label>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                    Enable or disable the "About" link in the main navigation menu.
                                </p>
                            </div>

                            {/* Add more settings here later if needed */}

                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default SiteSettings;
