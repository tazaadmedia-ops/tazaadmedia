import React from 'react';

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
                top: '20px', // Start slightly down so it doesn't overshoot the first dot
                bottom: 0,
                right: '111px', // precise alignment for rtl (matches dot center)
                width: '1px',
                backgroundColor: '#cbd5e1', // Sleek grey
                zIndex: 0
            }}></div>

            {updates.map((update, index) => {
                const isFirstActive = isLiveProfile && index === 0 && !update.is_pinned; // Only pulse nearest/latest active if unpinned
                const isPinnedCard = update.is_pinned;
                const dotColor = isFirstActive ? '#f59e0b' : '#f59e0b'; // Amber
                const ringColor = isPinnedCard ? '#dc2626' : '#fff'; // Red if pinned to stand out, otherwise white

                return (
                    <div key={update.id} style={{ position: 'relative', marginBottom: index === updates.length - 1 ? '0' : '2.5rem', zIndex: 1, display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

                        {/* Timeline Node / Time Column */}
                        <div style={{ width: '90px', flexShrink: 0, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            {/* Time text */}
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4b5563', whiteSpace: 'nowrap', paddingTop: '2px', width: '60px', textAlign: 'left' }}>
                                {formatTime(update.published_at)}
                            </div>

                            {/* Dot */}
                            <div style={{ position: 'relative', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                {isFirstActive && (
                                    <span style={{
                                        position: 'absolute',
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: dotColor,
                                        borderRadius: '50%',
                                        opacity: 0.4,
                                        animation: 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                    }}></span>
                                )}
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    backgroundColor: dotColor,
                                    border: `3px solid ${ringColor}`,
                                    boxShadow: '0 0 0 1px #cbd5e1', // subtle outer border to separate from white background
                                    position: 'relative',
                                    zIndex: 2
                                }}></div>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div style={{
                            flexGrow: 1,
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: update.is_pinned ? '1px solid #fecaca' : '1px solid #f3f4f6'
                        }}>
                            {update.is_pinned && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.5rem' }}>
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
                                style={{ fontSize: '1.1rem', color: '#374151', margin: 0 }}
                                dangerouslySetInnerHTML={{ __html: update.content }}
                            />
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
                `}
            </style>
        </div>
    );
};

export default LiveUpdateTimeline;
