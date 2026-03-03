import React from 'react';

interface LivePulseIndicatorProps {
    text?: string;
}

const LivePulseIndicator: React.FC<LivePulseIndicatorProps> = ({ text = 'لائيو اپڊيٽس' }) => {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', direction: 'rtl', lineHeight: 1 }}>
            <span style={{ animation: 'blinkText 1.5s ease-in-out infinite' }}>{text}</span>
            <div style={{ position: 'relative', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.75 }}></span>
                <span style={{ position: 'relative', borderRadius: '50%', width: '12px', height: '12px', backgroundColor: '#dc2626' }}></span>
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
        </div>
    );
};

export default LivePulseIndicator;
