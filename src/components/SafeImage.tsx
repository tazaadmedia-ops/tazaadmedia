import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackText?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, style, fallbackText, ...props }) => {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div style={{
                width: '100%',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#adb5bd',
                fontSize: '0.8rem',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                border: '1px solid #e9ecef',
                boxSizing: 'border-box',
                ...style,
                borderRadius: '0',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                msUserSelect: 'none',
            } as any}>
                <div style={{ textAlign: 'center', opacity: 0.8 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px', opacity: 0.5 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '0.02em', color: '#6c757d' }}>
                        {fallbackText || 'تصوير دستياب ناهي'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            style={{
                ...style,
                borderRadius: '0',
                display: 'block',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                pointerEvents: 'auto'
            } as any}
            onError={() => setError(true)}
            {...props}
        />
    );
};

export default SafeImage;
