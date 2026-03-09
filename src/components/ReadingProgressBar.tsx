import React, { useEffect, useState } from 'react';

const ReadingProgressBar: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollHeight - clientHeight <= 0) {
                setProgress(0);
                return;
            }

            const totalScroll = scrollHeight - clientHeight;
            const currentProgress = (scrollTop / totalScroll) * 100;
            setProgress(Math.min(100, Math.max(0, currentProgress)));
        };

        window.addEventListener('scroll', updateProgress);
        window.addEventListener('resize', updateProgress);

        // Initial check
        updateProgress();

        return () => {
            window.removeEventListener('scroll', updateProgress);
            window.removeEventListener('resize', updateProgress);
        };
    }, []);

    return (
        <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            position: 'absolute',
            bottom: 0,
            left: 0,
            zIndex: 1001,
            pointerEvents: 'none'
        }}>
            <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#FACC15',
                transition: 'width 0.1s ease-out'
            }} />
        </div>
    );
};

export default ReadingProgressBar;
