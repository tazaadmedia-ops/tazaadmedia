import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search } from 'lucide-react';

const MENU_ITEMS = [
    { to: "/", label: "هوم", alwaysShow: true },
    { to: "/category/analysis", label: "تجزيا", dbNames: ['Opinion', 'Analysis', 'تجزيا'] },
    { to: "/category/special-reports", label: "خصوصي رپورٽون", dbNames: ['Special Reports', 'Special Report', 'خصوصي رپورٽس', 'خصوصي رپورٽون'] },
    { to: "/category/sindh", label: "سنڌ", dbNames: ['Sindh', 'سنڌ'] },
    { to: "/category/region", label: "خطو", dbNames: ['Region', 'Nearby', 'خطو'] },
    { to: "/category/world", label: "دنيا", dbNames: ['World', 'International', 'دنيا'] }
];

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        checkActiveCategories();
    }, []);

    const checkActiveCategories = async () => {
        // Fetch all published articles' category names
        // This is a bit heavy if thousands of articles, but fine for MVP. 
        // Better approach: RPC 'get_active_categories'
        const { data } = await supabase
            .from('articles')
            .select(`
                categories ( name )
            `)
            .eq('status', 'published');

        if (data) {
            const activeSet = new Set<string>();
            data.forEach((row: any) => {
                if (row.categories?.name) {
                    activeSet.add(row.categories.name);
                }
            });
            setActiveCategories(activeSet);
        }
        // setLoading(false);
    };

    const isItemVisible = (item: any) => {
        if (item.alwaysShow) return true;
        if (!item.dbNames) return true; // Fallback
        // Check if ANY of the dbNames exist in activeCategories
        return item.dbNames.some((name: string) => activeCategories.has(name));
    };

    const handleSearch = () => {
        if (searchText.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchText)}`);
        }
    };

    return (
        <header style={{
            backgroundColor: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            direction: 'rtl'
        }}>
            {/* Top Bar - Deep Red Branding */}
            <div style={{
                backgroundColor: '#B70100',
                height: '60px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%'
                }}>
                    {/* Logo on the Right (RTL) */}
                    <NavLink to="/" style={{ display: 'flex', alignItems: 'center', height: '35px' }}>
                        <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 121.3 35.1" style={{ height: '32px', width: 'auto' }}>
                            <path fill="#fff" d="M112.5,2.1c10.4,11-7.5,18-4.5,28.5.5,1.7,1.5,3.2,2.7,4.5h-.2c-5.4-3.6-9.6-7.1-6.7-14.2,1.8-4.2,7.6-11.2,7.7-15.3,0-1.9-.6-3.9-1.5-5.6.1,0,.8.4.9.6.6.5,1.1,1,1.6,1.6Z" />
                            <path fill="#fff" d="M22.3,3.4v21.5h7v-10.2h4.3s.2,2.7.2,2.7c4.4-5.8,14-5.2,16.1,2.3s.1,5.2,1.9,5.2h40.7v-10.2h4.3v14.5h-44.7c-.4,0-2.3-1.5-2.7-1.9-.5.6-2.5,1.9-3.1,1.9h-28.3V3.4h4.3ZM45.7,24.9c2-10.8-11-8.7-12.1,0h12.1Z" />
                            <path fill="#fff" d="M111.3,33.1c0,0,.5.6,0,.2-5.8-7.7,5-13.7,5.4-21.3l1,2.1c1.7,5.4-2.9,9.2-5.2,13.5s-1.2,2.6-1.2,3.0c0,.8,0,1.7,0,2.5Z" />
                            <path fill="#fff" d="M113.9,35.1c-.4,0-.2,0-.3-.2-2.3-5.0,6.3-11.1,5.8-16.9,0-.4-.3-.8-.2-1.2.8,1.0,1.6,2.3,1.9,3.6,1.4,6.0-6.0,9.4-7.2,14.7Z" />
                            <path fill="#fff" d="M0,29.2v-4.3h9.8c0.6-6.8-1.2-8.1-7.8-7.4v-3.9h7.2c0.4,0,2.2,1,2.6,1.3,3.4,3,1.3,9.5,2.2,13.5l-.5,0.8H0Z" />
                            <path fill="#fff" d="M91.3,7c3.2-.5,3.6,5.4-.4,4.2s-1.7-3.8.4-4.2Z" />
                            <path fill="#fff" d="M97.1,7c2.6-.4,3.4,3.9.7,4.2s-3.3-3.8-.7-4.2Z" />
                            <path fill="#fff" d="M41.7,7c2.6-.4,3.4,3.9.7,4.2s-3.3-3.8-.7-4.2Z" />
                        </svg>
                    </NavLink>
                </div>
            </div>

            {/* Bottom Bar - White Navigation */}
            <div className="header-white-bar" style={{
                backgroundColor: '#fff',
                borderBottom: '1px solid #eee',
                height: '50px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div className="container header-container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%'
                }}>
                    <nav className="nav-scroll" style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'center' }}>
                        {MENU_ITEMS.map((item) => (
                            isItemVisible(item) && (
                                <NavMenuItem
                                    key={item.to}
                                    to={item.to}
                                    label={item.label}
                                    active={location.pathname === item.to}
                                />
                            )
                        ))}
                    </nav>

                    {/* Search Input (Moved here) */}
                    <div className="search-container" style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="ڳولا ڪريو"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 35px 8px 12px',
                                borderRadius: '20px',
                                border: '1px solid #ddd',
                                outline: 'none',
                                fontSize: '16px',
                                backgroundColor: '#f9f9f9',
                                color: '#333',
                                fontFamily: 'var(--font-main)'
                            }}
                        />
                        <Search
                            size={16}
                            color="#666"
                            onClick={handleSearch}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                opacity: 0.7,
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

const NavMenuItem: React.FC<{ to: string; label: string; active: boolean }> = ({ to, label, active }) => (
    <NavLink
        to={to}
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
        style={{
            ...navLinkStyle,
            color: active ? '#B70100' : '#1a1a1a',
            borderBottom: active ? '3px solid #B70100' : '3px solid transparent',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s ease'
        }}
    >
        {label}
    </NavLink>
);

const navLinkStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: '1.1rem',
    textDecoration: 'none',
    fontFamily: 'var(--font-main)',
    padding: '0 4px',
    whiteSpace: 'nowrap'
};

export default Header;
