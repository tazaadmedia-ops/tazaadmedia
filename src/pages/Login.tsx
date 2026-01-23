import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        console.log("Google Login Clicked"); // Debug Log
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: `${window.location.origin}/admin`
                },
            });
            if (error) {
                console.error("Supabase Auth Error:", error);
                throw error;
            }
        } catch (error: any) {
            console.error("Login Catch Error:", error);
            setError(error.message);
            alert("Error: " + error.message); // Explicit alert for user visibility
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            fontFamily: 'var(--font-main)',
            direction: 'rtl'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '60px', height: '60px',
                    backgroundColor: '#000', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <Lock color="white" size={28} />
                </div>

                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#111' }}>ايڊمنسٽريشن</h1>
                <p style={{ color: '#666', marginBottom: '2.5rem', fontSize: '1.1rem' }}>انتظامي پينل ۾ داخل ٿيڻ لاءِ گوگل ذريعي لاگ ان ٿيو</p>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2', color: '#dc2626',
                        padding: '12px', borderRadius: '8px', fontSize: '0.9rem',
                        marginBottom: '1.5rem', textAlign: 'right'
                    }}>
                        {error}
                    </div>
                )}

                {/* Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#333',
                        marginBottom: '1rem',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px' }} />
                    {loading ? 'انتظار ڪريو...' : 'گوگل ذريعي لاگ ان ٿيو'}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
