import React from 'react';

const SkeletonHome: React.FC = () => {
    return (
        <div className="container" style={{ marginTop: '2rem', direction: 'rtl' }}>
            {/* Hero + Side Grid Skeleton */}
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Hero Skeleton */}
                <div>
                    <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', marginBottom: '1rem' }} />
                    <div className="skeleton" style={{ width: '150px', height: '1rem', marginBottom: '0.75rem' }} />
                    <div className="skeleton" style={{ width: '90%', height: '2.5rem', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ width: '100%', height: '1.2rem', marginBottom: '0.4rem' }} />
                    <div className="skeleton" style={{ width: '80%', height: '1.2rem' }} />
                </div>

                {/* Side Grid Skeleton */}
                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', alignContent: 'start' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i}>
                            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/10', marginBottom: '0.5rem' }} />
                            <div className="skeleton" style={{ width: '60px', height: '0.7rem', marginBottom: '0.3rem' }} />
                            <div className="skeleton" style={{ width: '100%', height: '1rem', marginBottom: '0.2rem' }} />
                            <div className="skeleton" style={{ width: '80%', height: '1rem' }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row Skeleton */}
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #F0F0F0', marginBottom: '3rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                        <div className="skeleton" style={{ width: '100%', height: '1.2rem', marginBottom: '0.5rem' }} />
                        <div className="skeleton" style={{ width: '90%', height: '1.2rem', marginBottom: '0.5rem' }} />
                        <div className="skeleton" style={{ width: '60%', height: '0.8rem' }} />
                    </div>
                ))}
            </div>

            {/* Dynamic Section Skeleton */}
            {[1, 2].map(section => (
                <div key={section} style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                        <div className="skeleton" style={{ width: '120px', height: '1.5rem' }} />
                        <div className="skeleton" style={{ width: '60px', height: '1rem' }} />
                    </div>
                    <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i}>
                                <div className="skeleton" style={{ width: '100%', aspectRatio: '16/10', marginBottom: '0.8rem' }} />
                                <div className="skeleton" style={{ width: '100%', height: '1.2rem', marginBottom: '0.4rem' }} />
                                <div className="skeleton" style={{ width: '100%', height: '0.9rem', marginBottom: '0.3rem' }} />
                                <div className="skeleton" style={{ width: '70%', height: '0.9rem' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonHome;
