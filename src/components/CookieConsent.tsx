import React, { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'tazaad-cookie-consent';
const GA_MEASUREMENT_ID = 'G-6CC69WFL8K';

interface ConsentState {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    version: number;
}

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.analytics) {
                loadAnalytics();
            }
        } else {
            setIsVisible(true);
        }
    }, []);

    const loadAnalytics = () => {
        // Prevent duplicate loading
        if (window.hasOwnProperty('gtag')) return;

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { 'anonymize_ip': true });
        `;
        document.head.appendChild(inlineScript);
    };

    const handleAcceptAll = () => {
        const newState = { essential: true, analytics: true, marketing: true, version: 1 };
        saveConsent(newState);
        loadAnalytics();
    };

    const handleRejectAll = () => {
        const newState = { essential: true, analytics: false, marketing: false, version: 1 };
        saveConsent(newState);
    };

    const handleSavePreferences = (analytics: boolean, marketing: boolean) => {
        const newState = { essential: true, analytics, marketing, version: 1 };
        saveConsent(newState);
        if (analytics) loadAnalytics();
    };

    const saveConsent = (state: ConsentState) => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(state));
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            left: '20px',
            maxWidth: '500px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '0',
            boxShadow: 'none',
            padding: '24px',
            zIndex: 9999,
            direction: 'rtl',
            fontFamily: 'var(--font-main)',
            border: '2px solid #000',
            animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <style>
                {`
                    @keyframes slideUp {
                        from { transform: translateY(100px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .cookie-btn {
                        padding: 10px 20px;
                        border-radius: 0;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-family: var(--font-main);
                        font-size: 0.95rem;
                        border: 1px solid transparent;
                    }
                    .cookie-btn-primary {
                        background-color: var(--color-accent);
                        color: white;
                    }
                    .cookie-btn-primary:hover {
                        opacity: 0.9;
                        transform: translateY(-1px);
                    }
                    .cookie-btn-secondary {
                        background-color: #f0f0f0;
                        color: #333;
                        border: 1px solid #ddd;
                    }
                    .cookie-btn-secondary:hover {
                        background-color: #e5e5e5;
                    }
                    .cookie-toggle {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                    }
                `}
            </style>

            {!showDetails ? (
                <>
                    <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 900 }}>ڪوڪيز جي اجازت</h3>
                    <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '20px', lineHeight: '1.6' }}>
                        اسان اينالائيٽڪس ۽ اشتهارن لاءِ ڪوڪيز استعمال ڪندا آهيون ته جيئن توهان جي تجربي کي بهتر بڻائي سگهجي. ڇا توهان ان جي اجازت ڏيندؤ؟
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={handleAcceptAll} className="cookie-btn cookie-btn-primary">سڀ قبول ڪريو</button>
                        <button onClick={handleRejectAll} className="cookie-btn cookie-btn-secondary">سڀ رد ڪريو</button>
                        <button onClick={() => setShowDetails(true)} className="cookie-btn cookie-btn-secondary" style={{ backgroundColor: 'transparent', textDecoration: 'underline' }}>انتظام ڪريو</button>
                    </div>
                </>
            ) : (
                <PreferencesView onSave={handleSavePreferences} onBack={() => setShowDetails(false)} />
            )}
        </div>
    );
};

const PreferencesView: React.FC<{ onSave: (a: boolean, m: boolean) => void; onBack: () => void }> = ({ onSave, onBack }) => {
    const [analytics, setAnalytics] = useState(true);
    const [marketing, setMarketing] = useState(true);

    return (
        <div>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 900 }}>انتظام ڪريو</h3>

            <div className="cookie-toggle">
                <div>
                    <div style={{ fontWeight: 700 }}>لازمي (Essential)</div>
                    <div style={{ fontSize: '0.8rem', color: '#777' }}>سائيٽ جي بنيادي ڪم ڪار لاءِ ضروري.</div>
                </div>
                <div style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem' }}>هميشه فعال</div>
            </div>

            <div className="cookie-toggle">
                <div>
                    <div style={{ fontWeight: 700 }}>اينالائيٽڪس (Analytics)</div>
                    <div style={{ fontSize: '0.8rem', color: '#777' }}>اسان کي سائيٽ استعمال ڪندڙن جي ڄاڻ ڏين ٿيون.</div>
                </div>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent)', borderRadius: '0' }} />
            </div>

            <div className="cookie-toggle" style={{ borderBottom: 'none', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontWeight: 700 }}>مارڪيٽنگ (Marketing)</div>
                    <div style={{ fontSize: '0.8rem', color: '#777' }}>بهتر اشتهارن ۽ فيچرز لاءِ.</div>
                </div>
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent)' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => onSave(analytics, marketing)} className="cookie-btn cookie-btn-primary" style={{ flex: 1 }}>محفوظ ڪريو</button>
                <button onClick={onBack} className="cookie-btn cookie-btn-secondary">واپس</button>
            </div>
        </div>
    );
};

export default CookieConsent;
