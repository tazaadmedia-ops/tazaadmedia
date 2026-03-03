import React from 'react';
import { Share2 } from 'lucide-react';

export interface LiveUpdate {
    id: string;
    title: string | null;
    content: string; // HTML from rich text
    media_url: string | null;
    published_at: string;
    is_pinned: boolean;
}

interface LiveUpdateTimelineProps {
    updates: LiveUpdate[];
    isLiveProfile?: boolean; // Controls whether the first item gets the pulsing active animation
}

const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
};

const LiveUpdateTimeline: React.FC<LiveUpdateTimelineProps> = ({ updates, isLiveProfile = false }) => {
    if (!updates || updates.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>ڪا به اپڊيٽ موجود ناهي</div>;
    }

    return (
        <div style={{ position: 'relative', marginTop: '2rem', direction: 'rtl' }}>
            {/* Timeline Vertical Connector Line */}
            <div style={{
                position: 'absolute',
                top: '8px',
                bottom: 0,
                right: '11px',
                width: '1px',
                backgroundColor: '#d1d5db',
                zIndex: 0
            }}></div>

            {updates.map((update, index) => {
                const isFirstActive = isLiveProfile && index === 0 && !update.is_pinned;
                const isPinnedCard = update.is_pinned;

                return (
                    <div key={update.id} style={{ position: 'relative', marginBottom: index === updates.length - 1 ? '2rem' : '2.5rem', zIndex: 1 }}>

                        {/* Time Header with Dot */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', position: 'relative' }}>
                            {/* Dot on the line */}
                            <div style={{ position: 'absolute', right: '3.5px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isFirstActive && (
                                    <span style={{
                                        position: 'absolute',
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: '#f59e0b',
                                        borderRadius: '50%',
                                        opacity: 0.4,
                                        animation: 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                    }}></span>
                                )}
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    border: `2px solid #f59e0b`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    zIndex: 2
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                                </div>
                            </div>

                            {/* Time text */}
                            <div style={{ marginRight: '30px', fontSize: '0.95rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700 }}>{formatTime(update.published_at)}</span>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="live-update-card" style={{
                            marginRight: '30px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            position: 'relative',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            border: '1px solid #d1d5db'
                        }}>
                            {isPinnedCard && (
                                <div style={{
                                    display: 'inline-block',
                                    backgroundColor: '#dc2626',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    marginBottom: '1rem'
                                }}>
                                    📌 پِن ٿيل
                                </div>
                            )}

                            {update.title && (
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '1rem', lineHeight: 1.4 }}>
                                    {update.title}
                                </h3>
                            )}

                            {update.media_url && (
                                <div style={{ marginBottom: '1rem', borderRadius: '4px', overflow: 'hidden' }}>
                                    <img src={update.media_url} alt="Update media" style={{ width: '100%', height: 'auto', objectFit: 'contain', backgroundColor: '#f9fafb' }} />
                                </div>
                            )}

                            {/* Render rich text content safely */}
                            <div
                                className="article-content timeline-content"
                                style={{ fontSize: '1.1rem', color: '#374151', margin: 0, paddingBottom: '0.5rem', whiteSpace: 'pre-wrap' }}
                                dangerouslySetInnerHTML={{ __html: update.content }}
                            />

                            {/* Share Icon Floating at Bottom Left */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '20px',
                                transform: 'translateY(50%)',
                                backgroundColor: '#fff',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #d1d5db',
                                cursor: 'pointer',
                                color: '#4b5563',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb' }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff' }}
                            >
                                <Share2 size={16} />
                            </div>
                        </div>
                    </div>
                );
            })}

            <style>
                {`
                    @keyframes pulse-soft {
                        0%, 100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                        50% {
                            opacity: .5;
                            transform: scale(1.1);
                        }
                    }

                    @media (max-width: 640px) {
                        .live-update-card {
                            margin-right: 15px !important;
                            padding: 1rem !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default LiveUpdateTimeline;
