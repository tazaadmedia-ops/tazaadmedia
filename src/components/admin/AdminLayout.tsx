import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, FolderOpen, LogOut, ExternalLink, MessageSquare } from 'lucide-react';

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
            padding: '10px 16px',
            borderRadius: '12px',
            color: isActive ? '#000' : '#666',
            backgroundColor: isActive ? '#f3f4f6' : 'transparent',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: isActive ? 600 : 500,
            transition: 'all 0.2s ease',
            marginBottom: '4px'
        }}
        onMouseEnter={(e) => {
            if (!isActive) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.color = '#333';
            }
        }}
        onMouseLeave={(e) => {
            if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
            }
        }}
    >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        {label}
    </Link>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff', direction: 'ltr' }}>
            {/* Minimal Sidebar */}
            <aside style={{
                width: '240px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                backgroundColor: '#fff',
                borderRight: '1px solid #f3f4f6'
            }}>
                {/* Logo Area */}
                <div style={{ marginBottom: '3rem', paddingLeft: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 149.1 51" style={{ width: '130px', height: 'auto' }}>
                        <g>
                            <path d="M13.5,3c14.6,15.4-10.6,25.2-6.3,39.9s2.1,4.4,3.8,6.3h-.3C3.2,44.1-2.8,39.3,1.3,29.3c2.5-5.9,10.7-15.7,10.8-21.5,0-2.7-.8-5.5-2.1-7.8,0-.1,1.1.6,1.2.8.8.7,1.6,1.5,2.3,2.2Z" />
                            <path d="M11.9,46.5s.7.8,0,.3c-8.1-10.8,7-19.3,7.6-29.8l1.4,2.9c2.4,7.6-4.1,13-7.3,18.9s-1.7,3.6-1.7,4.3v3.5h0Z" />
                            <path d="M15.5,49.3c-.5,0-.3,0-.4-.3-3.3-7,8.9-15.6,8.1-23.7,0-.6-.5-1.1-.3-1.6,1.1,1.4,2.3,3.2,2.7,5,2,8.5-8.4,13.2-10.1,20.6Z" />
                        </g>
                        <g>
                            <path d="M149,14.8v24.5h-4.3c0-.2.3-1.4,0-1.4s-1.9,1.1-2.4,1.3c-7.8,2.8-14.5-5.4-11-12.7s7.2-6,11.5-4.2,1.2.7,1.8,1v-8.6h4.5,0ZM139,25.9c-6,.8-5.1,10.6,1.3,9.9,6.1-.7,5.3-10.7-1.3-9.9Z" />
                            <path d="M102.3,39.4v-1.4c-5.8,4.4-14,.7-14.4-6.6s8.1-12.5,14.4-7.8v-1.4h4.3v17.1h-4.3ZM96.6,25.9c-6,.8-5.1,10.5,1.3,9.9,6.1-.6,5.3-10.8-1.3-9.9Z" />
                            <path d="M64.8,39.4v-1.4c-.9.4-1.6,1-2.5,1.3-6.1,2.2-12.2-2.4-12.1-8.8.2-6.2,6.2-10.4,12.1-8.3s1.6,1,2.5,1.3v-1.4h4.1v17.1h-4.1v.2ZM56.3,34.3c4.7,4.9,11.7-3.2,6.4-7.5s-10.4,3.2-6.4,7.5Z" />
                            <path d="M123.6,39.4v-1.4c-.9.4-1.6,1-2.5,1.3-7,2.5-13.6-4-11.7-11,1.4-5.1,6.7-7.8,11.7-6.1,5,1.7,1.6.9,2.5,1.3v-1.4h4.1v17.1h-4.1v.2ZM117.9,25.9c-6,.8-5.1,10.3,1,9.9,6.3-.4,5.6-10.8-1-9.9Z" />
                            <path d="M66.9,7.8v9.4h3.1v-4.5h1.9v1.2c1.9-2.5,6.1-2.3,7.1,1s0,2.3.8,2.3h60.1v-4.5h1.9v6.3h-61.8c-.2,0-1-.6-1.2-.8-.2.3-1.1.8-1.4.8h-12.4V7.7h1.9ZM77.1,17.2c.9-4.7-4.8-3.8-5.3,0h5.3Z" />
                            <polygon points="53.5 14.8 53.5 19.3 45.8 19.3 45.8 39.4 41 39.4 41 19.3 33.3 19.3 33.3 14.8 53.5 14.8" />
                            <path d="M86.1,22.2v3.7l-8.6,9.3s.2.3.3.3h8.7v3.5l-.3.3h-14.7v-3.7c0-.5,6.5-6.9,7.3-8l1.3-1.7h-8.2v-3.8h14.2Z" />
                            <path d="M57.1,19.1v-1.9h4.3c.3-3-.5-3.5-3.4-3.3v-1.7h3.2c.2,0,.9.4,1.1.6,1.5,1.3.6,4.2,1,5.9l-.2.3h-6Z" />
                            <path d="M139.3,9.4c1.4-.2,1.6,2.3-.2,1.8s-.7-1.7.2-1.8Z" />
                            <path d="M141.9,9.4c1.1-.2,1.5,1.7.3,1.9s-1.5-1.7-.3-1.9Z" />
                            <path d="M75.4,9.4c1.1-.2,1.5,1.7.3,1.9s-1.5-1.7-.3-1.9Z" />
                        </g>
                    </svg>
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <SidebarItem
                        to="/admin"
                        icon={LayoutDashboard}
                        label="Dashboard"
                        isActive={isActive('/admin')}
                    />
                    <SidebarItem
                        to="/admin/new"
                        icon={FileText}
                        label="New Article"
                        isActive={isActive('/admin/new')}
                    />
                    <SidebarItem
                        to="/admin/authors"
                        icon={Users}
                        label="Authors"
                        isActive={isActive('/admin/authors')}
                    />
                    <SidebarItem
                        to="/admin/categories"
                        icon={FolderOpen}
                        label="Categories"
                        isActive={isActive('/admin/categories')}
                    />
                    <SidebarItem
                        to="/admin/reports"
                        icon={MessageSquare}
                        label="Reports"
                        isActive={isActive('/admin/reports')}
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
                            padding: '10px 16px',
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
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff1f2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                marginLeft: '240px',
                padding: '2.5rem 4rem',
                backgroundColor: '#fff',
                maxWidth: '1600px'
            }}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
