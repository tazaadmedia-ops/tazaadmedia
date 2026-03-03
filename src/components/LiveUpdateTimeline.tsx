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

const LiveUpdateTimeline: React.FC<LiveUpdateTimelineProps> = ({ updates }) => {
    if (!updates || updates.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>ڪا به اپڊيٽ موجود ناهي</div>;
    }

    // Sort pinned to top (optional, if we want pinned explicitly decoupled from time in display)
    // For now we'll just show pinned styling inline

    return (
        <div style={{ position: 'relative', marginTop: '2rem', direction: 'rtl' }}>
            {/* Timeline Vertical Line */}
            <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: '40px', // Right-aligned for RTL
                width: '2px',
                backgroundColor: '#e5e7eb',
                zIndex: 0
            }}></div>

            {updates.map((update) => (
                <div key={update.id} style={{ position: 'relative', marginBottom: '3rem', zIndex: 1, display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

                    {/* Timeline Node / Time Column */}
                    <div style={{ width: '80px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: update.is_pinned ? '#dc2626' : '#fff',
                            border: `3px solid ${update.is_pinned ? '#dc2626' : '#e5e7eb'}`,
                            boxShadow: '0 0 0 4px #fff', // knockout effect over line
                            marginBottom: '0.5rem',
                            position: 'relative',
                            right: '-1px' // centering correction over 2px line
                        }}></div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', whiteSpace: 'nowrap' }}>
                            {formatTime(update.published_at)}
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

                        {/* Render rich text content carefully */}
                        <div
                            className="article-content"
                            style={{ fontSize: '1.1rem', color: '#374151', margin: 0 }}
                            dangerouslySetInnerHTML={{ __html: update.content }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LiveUpdateTimeline;
