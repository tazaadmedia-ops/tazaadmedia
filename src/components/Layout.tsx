import React, { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';

interface LayoutProps {
    children: ReactNode;
    flush?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, flush }) => {
    return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1, paddingTop: flush ? '0' : '1.5rem' }}>
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
