import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackText?: string;
    width?: string | number;
    height?: string | number;
    fetchPriority?: "high" | "low" | "auto";
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, style, fallbackText, width, height, fetchPriority, ...props }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

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

    let optimizedSrc = src;
    
    // Enable Supabase Image Transformations to fix Lighthouse "Improve Image Delivery" warnings.
    // Automatically convert to WebP and resize based on passed width limits
    if (optimizedSrc && optimizedSrc.includes('supabase.co') && !optimizedSrc.includes('?')) {
        let qs = `?quality=80&format=webp`;
        // if width is provided, instruct Supabase to resize it down to save bandwidth
        if (width) qs += `&width=${width}`;
        
        optimizedSrc = `${optimizedSrc}${qs}`;
    }

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {loading && (
                <div
                    className="skeleton"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        aspectRatio: (width && height) ? `${width}/${height}` : undefined
                    }}
                />
            )}
            <img
                src={optimizedSrc}
                alt={alt}
                width={width}
                height={height}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
                style={{
                    ...style,
                    borderRadius: '0',
                    display: 'block',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'auto',
                    opacity: loading ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out',
                    aspectRatio: (width && height) ? `${width}/${height}` : undefined
                } as any}
                decoding="async"
                fetchPriority={fetchPriority}
                {...props}
            />
        </div>
    );
};

export default SafeImage;

