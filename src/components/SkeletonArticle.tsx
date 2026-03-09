import React from 'react';

const SkeletonArticle: React.FC = () => {
    return (
        <article className="container article-page-container page-top-margin" style={{ fontFamily: 'var(--font-main)', direction: 'rtl' }}>
            {/* Header Skeleton */}
            <header className="article-header" style={{ marginBottom: '3rem', textAlign: 'right', direction: 'rtl', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                <div className="skeleton" style={{ width: '80px', height: '1rem', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ width: '100%', height: '3rem', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ width: '70%', height: '3rem', marginBottom: '2rem' }} />

                <div className="skeleton" style={{ width: '100%', height: '1.5rem', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ width: '90%', height: '1.5rem', marginBottom: '2rem' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '1.25rem 0' }}>
                    <div className="skeleton" style={{ width: '150px', height: '1.2rem' }} />
                    <span style={{ color: '#eee' }}>|</span>
                    <div className="skeleton" style={{ width: '100px', height: '1rem' }} />
                </div>
            </header>

            {/* Featured Image Skeleton */}
            <div style={{ marginBottom: '1rem', width: '100%', maxWidth: '1080px', margin: '0 auto 1rem auto' }}>
                <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '40%', height: '0.9rem', marginTop: '0.5rem', marginLeft: 'auto' }} />
            </div>

            {/* Content Skeleton */}
            <div className="article-content" style={{ maxWidth: '800px', margin: '3rem auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="skeleton" style={{ width: '100%', height: '1.2rem' }} />
                <div className="skeleton" style={{ width: '95%', height: '1.2rem' }} />
                <div className="skeleton" style={{ width: '98%', height: '1.2rem' }} />
                <div className="skeleton" style={{ width: '92%', height: '1.2rem' }} />
                <div className="skeleton" style={{ width: '100%', height: '1.2rem' }} />
                <div className="skeleton" style={{ width: '40%', height: '1.2rem', marginBottom: '2rem' }} />

                <div className="skeleton" style={{ width: '100%', height: '1.2rem' }} />
                <div className="skeleton" style={{ width: '96%', height: '1.2rem' }} />
                <div className="skeleton" style={{ width: '93%', height: '1.2rem' }} />
                <div className="skeleton" style={{ width: '97%', height: '1.2rem' }} />
            </div>
        </article>
    );
};

export default SkeletonArticle;
