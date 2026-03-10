import React, { useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'tazaad-cookie-consent';
const GA_MEASUREMENT_ID = 'G-6CC69WFL8K';

const CookieConsent: React.FC = () => {
    useEffect(() => {
        const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.analytics) {
                loadAnalytics();
            }
        } else {
            // Auto-accept on first visit
            const newState = { essential: true, analytics: true, version: 1 };
            localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newState));
            loadAnalytics();
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

    return null;
};

export default CookieConsent;
