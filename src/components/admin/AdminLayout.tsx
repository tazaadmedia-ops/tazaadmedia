import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, FolderOpen, LogOut, ExternalLink, MessageSquare, Menu, X, Settings as SettingsIcon } from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, isActive, onClick }: any) => (
    <Link
        to={to}
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            color: isActive ? '#000' : '#666',
            backgroundColor: isActive ? '#f3f4f6' : 'transparent',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: isActive ? 600 : 500,
            transition: 'all 0.2s ease',
            marginBottom: '4px'
        }}
    >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        {label}
    </Link>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const sidebarWidth = '260px';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fff', direction: 'ltr' }}>

            {/* Mobile Header */}
            {isMobile && (
                <header style={{
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.5rem',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: '#fff',
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    zIndex: 100
                }}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', color: '#111' }}
                    >
                        <Menu size={24} />
                    </button>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Admin Panel</div>
                    <div style={{ width: '40px' }} /> {/* Spacer */}
                </header>
            )}

            <div style={{ display: 'flex', flex: 1, paddingTop: isMobile ? '60px' : 0 }}>
                {/* Sidebar Drawer / Static */}
                <aside style={{
                    width: sidebarWidth,
                    padding: '2rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: isMobile ? (isSidebarOpen ? 0 : `-${sidebarWidth}`) : 0,
                    backgroundColor: '#fff',
                    borderRight: '1px solid #f3f4f6',
                    zIndex: 200,
                    transition: 'left 0.3s ease'
                }}>
                    {/* Sidebar Header with Close Button (Mobile Only) */}
                    <div style={{ marginBottom: '3rem', paddingLeft: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-accent)' }}>TAZAAD</div>
                        {isMobile && (
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                            >
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <SidebarItem
                            to="/admin"
                            icon={LayoutDashboard}
                            label="Dashboard"
                            isActive={isActive('/admin')}
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                        />
                        <SidebarItem
                            to="/admin/new"
                            icon={FileText}
                            label="New Article"
                            isActive={isActive('/admin/new')}
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                        />
                        <SidebarItem
                            to="/admin/authors"
                            icon={Users}
                            label="Authors"
                            isActive={isActive('/admin/authors')}
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                        />
                        <SidebarItem
                            to="/admin/categories"
                            icon={FolderOpen}
                            label="Categories"
                            isActive={isActive('/admin/categories')}
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                        />
                        <SidebarItem
                            to="/admin/reports"
                            icon={MessageSquare}
                            label="Reports"
                            isActive={isActive('/admin/reports')}
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                        />
                        <SidebarItem
                            to="/admin/settings"
                            icon={SettingsIcon}
                            label="Site Settings"
                            isActive={isActive('/admin/settings')}
                            onClick={() => isMobile && setIsSidebarOpen(false)}
                        />
                    </nav>

                    {/* Bottom Actions */}
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                        <SidebarItem
                            to="/"
                            icon={ExternalLink}
                            label="View Website"
                            isActive={false}
                        />
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#e11d48',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                marginTop: '4px',
                                textAlign: 'left'
                            }}
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Overlay for Mobile Drawer */}
                {isMobile && isSidebarOpen && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 150,
                            backdropFilter: 'blur(4px)'
                        }}
                    />
                )}

                {/* Main Content Area */}
                <main style={{
                    flex: 1,
                    marginLeft: isMobile ? 0 : sidebarWidth,
                    padding: isMobile ? '1.5rem' : '2.5rem 4rem',
                    backgroundColor: '#fff',
                    maxWidth: isMobile ? '100%' : '1600px',
                    transition: 'margin-left 0.3s ease'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
