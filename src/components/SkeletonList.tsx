import React from 'react';

const SkeletonList: React.FC = () => {
    return (
        <div className="container" style={{ marginTop: '2rem', direction: 'rtl' }}>
            <div className="skeleton" style={{ width: '200px', height: '2.5rem', marginBottom: '3rem' }} />

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="mobile-grid-1" style={{
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr',
                            gap: '3rem',
                            borderBottom: '1px solid #f0f0f0',
                            paddingBottom: '3rem',
                            textAlign: 'right'
                        }}>
                            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/10' }} />
                            <div>
                                <div className="skeleton" style={{ width: '90%', height: '2rem', marginBottom: '1rem' }} />
                                <div className="skeleton" style={{ width: '100%', height: '1.2rem', marginBottom: '0.5rem' }} />
                                <div className="skeleton" style={{ width: '80%', height: '1.2rem', marginBottom: '1rem' }} />
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div className="skeleton" style={{ width: '100px', height: '0.8rem' }} />
                                    <div className="skeleton" style={{ width: '80px', height: '0.8rem' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SkeletonList;
