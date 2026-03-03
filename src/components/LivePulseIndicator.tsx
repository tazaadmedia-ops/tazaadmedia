import React from 'react';

interface LivePulseIndicatorProps {
    text?: string;
}

const LivePulseIndicator: React.FC<LivePulseIndicatorProps> = ({ text = 'لائيو اپڊيٽس' }) => {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', direction: 'rtl' }}>
            <div style={{ position: 'relative', width: '12px', height: '12px' }}>
                <span style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.75 }}></span>
                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', width: '12px', height: '12px', backgroundColor: '#dc2626' }}></span>
            </div>
            <style>
                {`
                    @keyframes ping {
                        75%, 100% {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                    @keyframes blinkText {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}
            </style>
            <span style={{ animation: 'blinkText 1.5s ease-in-out infinite' }}>{text}</span>
        </div>
    );
};

export default LivePulseIndicator;
