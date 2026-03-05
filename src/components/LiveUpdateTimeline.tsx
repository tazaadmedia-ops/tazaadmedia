import React, { useState } from 'react';
import { Share2, Twitter, Facebook, MessageCircle, Copy, X, Pin } from 'lucide-react';
import { TwitterTweetEmbed } from 'react-twitter-embed';

export interface LiveUpdate {
    id: string;
    title: string | null;
    content: string; // HTML from rich text
    media_url: string | null;
    video_url: string | null;
    published_at: string;
    is_pinned: boolean;
}

interface LiveUpdateTimelineProps {
    updates: LiveUpdate[];
    isLiveProfile?: boolean; // Controls whether the first item gets the pulsing active animation
    newlyAddedIds?: Set<string>;
}

const formatRelativeTime = (dateString: string) => {
    const publishedDate = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - publishedDate.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (diffInSeconds < 60) {
        return 'ڪجهه سيڪنڊ اڳ ۾'; // A few seconds ago
    } else if (minutes < 60) {
        return `${minutes} منٽ اڳ ۾`;
    } else if (hours < 24) {
        return `${hours} ڪلاڪ اڳ ۾`;
    } else if (days < 30) {
        return `${days} ڏينھن اڳ ۾`;
    } else if (months < 12) {
        return `${months} مھينا اڳ ۾`;
    } else {
        return `${years} سال اڳ ۾`;
    }
};

const getTweetId = (url: string) => {
    // Robust regex to handle x.com, twitter.com, mobile.twitter.com and various share parameters
    const match = url.match(/(?:\/|status\/)(\d+)(?:\/|\?|$)/);
    return match ? match[1] : null;
};

const getVideoData = (url: string) => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) return { type: 'youtube', id: ytMatch[1] };

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };

    // Facebook Video
    if (url.includes('facebook.com') && url.includes('videos')) return { type: 'facebook', url };

    // Direct Video (mp4, webm, mov)
    if (url.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) return { type: 'direct', url };

    return null;
};
village

const LiveUpdateTimeline: React.FC<LiveUpdateTimelineProps> = ({ updates, isLiveProfile = false, newlyAddedIds = new Set() }) => {
    const [openShareMenuId, setOpenShareMenuId] = useState<string | null>(null);

    const handleShareClick = (e: React.MouseEvent, updateId: string) => {
        e.stopPropagation();
        setOpenShareMenuId(openShareMenuId === updateId ? null : updateId);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("لنڪ ڪاپي ٿي وئي آهي (Link copied to clipboard)");
            setOpenShareMenuId(null);
        } catch (err) {
            console.error("Clipboard error:", err);
        }
    };
    // handleShare removed as we now use specific social links or copy

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
                    <div key={update.id} id={`update-${update.id}`} style={{ position: 'relative', marginBottom: index === updates.length - 1 ? '2rem' : '2.5rem', zIndex: 1 }}>

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
                                <span style={{ fontWeight: 700 }}>{formatRelativeTime(update.published_at)}</span>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className={`live-update-card ${newlyAddedIds.has(update.id) ? 'animate-new-item' : ''}`} style={{
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
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: '#dc2626',
                                    color: '#fff',
                                    padding: '4px 10px',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    marginBottom: '1rem',
                                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                                }}>
                                    <Pin size={12} strokeWidth={3} /> پِن ٿيل
                                </div>
                            )}

                            {update.title && (
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '1rem', lineHeight: 1.4 }}>
                                    {update.title}
                                </h3>
                            )}

                            {/* Video Player - Shown after title */}
                            {update.video_url && (
                                <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                                    {(() => {
                                        const video = getVideoData(update.video_url || '');
                                        if (!video) return null;

                                        if (video.type === 'youtube') {
                                            return (
                                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${video.id}`}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title="YouTube video"
                                                    ></iframe>
                                                </div>
                                            );
                                        }

                                        if (video.type === 'vimeo') {
                                            return (
                                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                                    <iframe
                                                        src={`https://player.vimeo.com/video/${video.id}`}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                        frameBorder="0"
                                                        allow="autoplay; fullscreen; picture-in-picture"
                                                        allowFullScreen
                                                        title="Vimeo video"
                                                    ></iframe>
                                                </div>
                                            );
                                        }

                                        if (video.type === 'direct') {
                                            return (
                                                <video
                                                    src={video.url}
                                                    controls
                                                    playsInline
                                                    style={{ width: '100%', display: 'block' }}
                                                />
                                            );
                                        }

                                        return null;
                                    })()}
                                </div>
                            )}

                            {/* Render rich text content safely */}
                            <div
                                className="article-content timeline-content"
                                style={{ fontSize: '1.1rem', color: '#374151', margin: 0, paddingBottom: '0.5rem', whiteSpace: 'pre-wrap' }}
                                dangerouslySetInnerHTML={{ __html: update.content }}
                            />

                            {update.media_url && (
                                <div style={{ marginTop: '1rem', marginBottom: '1rem', borderRadius: '4px', overflow: 'hidden' }}>
                                    {getTweetId(update.media_url) ? (
                                        <div style={{
                                            direction: 'ltr',
                                            minHeight: '250px',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            padding: '10px'
                                        }}>
                                            <div style={{ width: '100%', maxWidth: '650px' }}>
                                                <TwitterTweetEmbed
                                                    tweetId={getTweetId(update.media_url)!}
                                                    options={{ conversation: 'none', width: '100%' }}
                                                    placeholder={<div style={{ color: '#666', fontSize: '0.9rem', padding: '20px' }}>Twitter لوڊ ٿي رهيو آهي...</div>}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={update.media_url}
                                            alt="Update media"
                                            style={{ width: '100%', height: 'auto', objectFit: 'contain', backgroundColor: '#f9fafb' }}
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Share Button & Menu */}
                            <div style={{ position: 'absolute', bottom: 0, left: '20px', transform: 'translateY(50%)', zIndex: 10 }}>
                                <div
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid #d1d5db',
                                        cursor: 'pointer',
                                        color: openShareMenuId === update.id ? '#dc2626' : '#4b5563',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={(e) => handleShareClick(e, update.id)}
                                    title="Share this update"
                                >
                                    {openShareMenuId === update.id ? <X size={16} /> : <Share2 size={16} />}
                                </div>

                                {openShareMenuId === update.id && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '40px',
                                        left: 0,
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                        border: '1px solid #e5e7eb',
                                        padding: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        minWidth: '150px',
                                        animation: 'fade-in-up 0.2s ease-out'
                                    }}>
                                        {[
                                            {
                                                name: 'X (Twitter)',
                                                icon: <Twitter size={14} />,
                                                link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(update.title || 'Tazaad Update')}&url=${encodeURIComponent(window.location.origin + window.location.pathname + '#update-' + update.id)}`
                                            },
                                            {
                                                name: 'Facebook',
                                                icon: <Facebook size={14} />,
                                                link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + window.location.pathname + '#update-' + update.id)}`
                                            },
                                            {
                                                name: 'WhatsApp',
                                                icon: <MessageCircle size={14} />,
                                                link: `https://api.whatsapp.com/send?text=${encodeURIComponent((update.title || 'Tazaad Update') + ' ' + window.location.origin + window.location.pathname + '#update-' + update.id)}`
                                            }
                                        ].map((platform) => (
                                            <a
                                                key={platform.name}
                                                href={platform.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '8px 12px',
                                                    fontSize: '0.85rem',
                                                    color: '#374151',
                                                    textDecoration: 'none',
                                                    borderRadius: '6px',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                onClick={() => setOpenShareMenuId(null)}
                                            >
                                                {platform.icon} {platform.name}
                                            </a>
                                        ))}
                                        <div
                                            onClick={() => copyToClipboard(window.location.origin + window.location.pathname + '#update-' + update.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '8px 12px',
                                                fontSize: '0.85rem',
                                                color: '#374151',
                                                cursor: 'pointer',
                                                borderRadius: '6px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <Copy size={14} /> لنڪ ڪاپي ڪريو
                                        </div>
                                    </div>
                                )}
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

                    @keyframes fade-in-up {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .animate-new-item {
                        animation: slide-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }

                    @keyframes slide-fade-in {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
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
