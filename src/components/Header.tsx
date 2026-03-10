import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Facebook, Instagram, Twitter, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isArticlePage = location.pathname.startsWith('/article/') ||
        location.pathname.startsWith('/live/') ||
        (location.pathname !== '/' && location.pathname.split('/').length === 2 && !location.pathname.includes('.'));

    const [menuItems, setMenuItems] = useState<any[]>([
        { to: "/", label: "هوم", alwaysShow: true }
    ]);
    const [tickerArticles, setTickerArticles] = useState<any[]>([]);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTickerTransitioning, setIsTickerTransitioning] = useState(true);

    // Search Popup State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [scrollProgress, setScrollProgress] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const lastScrollY = useRef(0);



    useEffect(() => {
        fetchNavbarData();
        fetchTickerArticles();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 100) {
                setIsScrolled(false);
            } else if (currentScrollY > lastScrollY.current) {
                // Scrolling down
                setIsScrolled(true);
            } else {
                // Scrolling up
                setIsScrolled(false);
            }

            lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;

            // Note: The second check is for the "short slug" URLs like /slug-name
            if (isArticlePage) {
                const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
                if (totalScroll > 0) {
                    const currentProgress = (currentScrollY / totalScroll) * 100;
                    setScrollProgress(currentProgress);
                }
            } else {
                setScrollProgress(0);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check for progress on page load/navigation
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname, isArticlePage]);



    useEffect(() => {
        if (tickerArticles.length > 1) {
            const timer = setInterval(() => {
                const nextIndex = currentNewsIndex + 1;
                setIsTickerTransitioning(true);
                setCurrentNewsIndex(nextIndex);

                // If we've reached the clone (last item), jump back to the start
                if (nextIndex === tickerArticles.length - 1) {
                    setTimeout(() => {
                        setIsTickerTransitioning(false);
                        setCurrentNewsIndex(0);
                    }, 800); // Wait for animation to finish (matches css transition)
                }
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [tickerArticles, currentNewsIndex]);


    // Close menu/search on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
    }, [location]);

    // Instant Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = searchQuery.trim();
            if (trimmed.length > 1) {
                performSearch(trimmed);
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        try {
            // Sanitize query for .or() syntax which uses commas as separators
            const safeQuery = query.replace(/[,()]/g, ' ');

            const { data, error } = await supabase
                .from('articles')
                .select('id, title, slug, featured_image_url, primary_category_id, categories(name)')
                .or(`title.ilike.%${safeQuery}%,subdeck.ilike.%${safeQuery}%`)
                .eq('status', 'published')
                .limit(6);

            if (error) {
                console.error('Search query error:', error);
                throw error;
            }
            setSearchResults(data || []);
        } catch (err: any) {
            console.error('Search failure:', err.message || err);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchNavbarData = async () => {

        // Fetch Categories
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, slug, display_order')
            .eq('is_visible_on_navbar', true)
            .order('display_order', { ascending: true });

        const items = [
            { to: "/", label: "هوم", id: 'home' }
        ];

        if (categories) {
            categories.forEach(cat => {
                items.push({
                    to: `/topic/${cat.slug}`,
                    label: cat.name,
                    id: cat.id
                });
            });
        }


        setMenuItems(items);
    };

    const fetchTickerArticles = async () => {
        const { data } = await supabase
            .from('articles')
            .select('title, slug, id, is_live')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(5); // Limited to 5 articles as requested

        if (data && data.length > 0) {
            // Add a clone of the first item at the end for seamless looping
            setTickerArticles([...data, data[0]]);
        }
    };



    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const hideOnScroll = isArticlePage && isScrolled && isMobile;


    return (
        <>
            <header style={{
                backgroundColor: '#fff',
                position: 'sticky',
                top: 0,
                zIndex: 2000,
                direction: 'rtl',
                boxShadow: hideOnScroll ? 'none' : '0 2px 10px rgba(0,0,0,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
            }}>
                <div style={{
                    transform: hideOnScroll ? 'translateY(calc(-100% + 3px))' : 'translateY(0)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: '#fff'
                }}>
                    {/* --- TOP BAR (WHITE) --- */}
                    <div className="container" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '65px',
                        width: '100%'
                    }}>
                        {/* Right Area: Menu Button (Mobile) + Logo + Nav (Desktop) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                className="show-mobile"
                                onClick={() => setIsMenuOpen(true)}
                                aria-label="مينيو"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    color: '#111',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Menu size={24} strokeWidth={2.5} />
                            </button>

                            <NavLink to="/" aria-label="هوم" style={{ display: 'flex', alignItems: 'center' }}>
                                <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 121.3 35.1" style={{ height: '34px', width: 'auto' }}>
                                    <path fill="#B70100" d="M112.5,2.1c10.4,11-7.5,18-4.5,28.5.5,1.7,1.5,3.2,2.7,4.5h-.2c-5.4-3.6-9.6-7.1-6.7-14.2,1.8-4.2,7.6-11.2,7.7-15.3,0-1.9-.6-3.9-1.5-5.6.1,0,.8.4.9.6.6.5,1.1,1,1.6,1.6Z" />
                                    <path fill="#B70100" d="M22.3,3.4v21.5h7v-10.2h4.3s.2,2.7.2,2.7c4.4-5.8,14-5.2,16.1,2.3s.1,5.2,1.9,5.2h40.7v-10.2h4.3v14.5h-44.7c-.4,0-2.3-1.5-2.7-1.9-.5.6-2.5,1.9-3.1,1.9h-28.3V3.4h4.3ZM45.7,24.9c2-10.8-11-8.7-12.1,0h12.1Z" />
                                    <path fill="#B70100" d="M111.3,33.1c0,0,.5.6,0,.2-5.8-7.7,5-13.7,5.4-21.3l1,2.1c1.7,5.4-2.9,9.2-5.2,13.5s-1.2,2.6-1.2,3.0c0,.8,0,1.7,0,2.5Z" />
                                    <path fill="#B70100" d="M113.9,35.1c-.4,0-.2,0-.3-.2-2.3-5.0,6.3-11.1,5.8-16.9,0-.4-.3-.8-.2-1.2.8,1.0,1.6,2.3,1.9,3.6,1.4,6.0-6.0,9.4-7.2,14.7Z" />
                                    <path fill="#B70100" d="M0,29.2v-4.3h9.8c0.6-6.8-1.2-8.1-7.8-7.4v-3.9h7.2c0.4,0,2.2,1,2.6,1.3,3.4,3,1.3,9.5,2.2,13.5l-.5,0.8H0Z" />
                                    <path fill="#B70100" d="M91.3,7c3.2-.5,3.6,5.4-.4,4.2s-1.7-3.8.4-4.2Z" />
                                    <path fill="#B70100" d="M97.1,7c2.6-.4,3.4,3.9.7,4.2s-3.3-3.8-.7-4.2Z" />
                                    <path fill="#B70100" d="M41.7,7c2.6-.4,3.4,3.9.7,4.2s-3.3-3.8-.7-4.2Z" />
                                </svg>
                            </NavLink>

                            {/* Navigation - Compressed (Desktop) */}
                            <nav className="nav-scroll hide-mobile" style={{ marginRight: '1rem' }}>
                                {menuItems.map((item) => (
                                    <NavMenuItem
                                        key={item.to}
                                        to={item.to}
                                        label={item.label}
                                        active={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))}
                                    />
                                ))}
                            </nav>
                        </div>

                        {/* Left Area: Socials + Search Icon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="header-socials hide-mobile">
                                <a href="https://facebook.com/thetazaad" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                                    <Facebook size={19} fill="currentColor" strokeWidth={0} />
                                </a>
                                <a href="https://instagram.com/thetazaad" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                                    <Instagram size={19} strokeWidth={2.5} />
                                </a>
                                <a href="https://x.com/thetazaad" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                                    <Twitter size={19} fill="currentColor" strokeWidth={0} />
                                </a>
                            </div>

                            <button
                                onClick={() => setIsSearchOpen(true)}
                                aria-label="ڳوليو"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    color: '#333'
                                }}
                            >
                                <Search size={22} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* --- BOTTOM BAR (RED NEWS SLIDER) --- */}
                    <div style={{ backgroundColor: 'var(--color-accent)', width: '100%' }}>
                        <div className="container">
                            <div className="news-ticker-bar">
                                <div className="news-ticker-label">
                                    تازيون رپورٽون <span className="news-ticker-separator">|</span>
                                </div>
                                <div className="news-ticker-container">
                                    <div
                                        className="news-ticker-list"
                                        style={{
                                            transform: `translateY(-${currentNewsIndex * 100}%)`,
                                            transition: isTickerTransitioning ? 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)' : 'none'
                                        }}
                                    >
                                        {tickerArticles.map((art, i) => (
                                            <Link
                                                key={`${art.id}-${i}`}
                                                to={art.is_live ? `/live/${art.slug}` : `/${art.slug}`}
                                                className="news-ticker-item"
                                            >
                                                {art.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reading Progress Bar (Now below the ticker) - Only on article pages */}
                    {isArticlePage && (
                        <div style={{
                            height: '3px',
                            width: '100%',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                height: '100%',
                                backgroundColor: '#B70100',
                                width: '100%',
                                transform: `scaleX(${scrollProgress / 100})`,
                                transformOrigin: 'right',
                                transition: 'transform 0.1s linear',
                                opacity: scrollProgress > 0 ? 1 : 0,
                                zIndex: 10
                            }} />

                        </div>
                    )}
                </div>
            </header>



            {/* --- MOBILE DRAWER MENU --- */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
                <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
                    <div className="mobile-menu-header">
                        <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>مينيو</span>
                        <button onClick={() => setIsMenuOpen(false)} aria-label="بند ڪريو">
                            <X size={28} />
                        </button>
                    </div>

                    <nav className="mobile-menu-nav">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => isActive ? "mobile-nav-link active" : "mobile-nav-link"}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mobile-menu-socials">
                        <a href="https://facebook.com/thetazaad" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <Facebook size={24} fill="currentColor" strokeWidth={0} />
                        </a>
                        <a href="https://instagram.com/thetazaad" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram size={24} strokeWidth={2} />
                        </a>
                        <a href="https://x.com/thetazaad" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <Twitter size={24} fill="currentColor" strokeWidth={0} />
                        </a>
                    </div>
                </div>
            </div>

            {/* --- SEARCH OVERLAY --- */}
            <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`} onClick={() => setIsSearchOpen(false)}>
                <div className="search-content" onClick={(e) => e.stopPropagation()}>
                    <div className="search-header">
                        <div style={{ position: 'relative', flexGrow: 1 }}>
                            <input
                                type="text"
                                placeholder="ڳوليو..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus={isSearchOpen}
                                className="search-input-large"
                            />
                            {isSearching && <div className="search-loader-inline" />}
                        </div>
                        <button onClick={() => setIsSearchOpen(false)} className="search-close-btn">
                            <X size={32} />
                        </button>
                    </div>

                    <div className="search-results-container">
                        {searchResults.length > 0 ? (
                            <div className="search-results-grid">
                                {searchResults.map((art) => (
                                    <Link key={art.id} to={`/${art.slug}`} className="search-result-item" onClick={() => setIsSearchOpen(false)}>
                                        {art.featured_image_url && (
                                            <div className="search-result-img" style={{ backgroundImage: `url(${art.featured_image_url})` }} />
                                        )}
                                        <div className="search-result-info">
                                            <div className="search-result-cat">{art.categories?.name}</div>
                                            <div className="search-result-title">{art.title}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : searchQuery.length > 2 && !isSearching ? (
                            <div className="search-no-results">ڪو به مضمون نه مليو.</div>
                        ) : searchQuery.length === 0 ? (
                            <div className="search-prompt">مضمون ڳولڻ لاءِ لکو...</div>
                        ) : null}

                        {searchResults.length > 0 && (
                            <button
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                }}
                                className="search-view-all-btn"
                            >
                                سڀ نتيجا ڏسو
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const NavMenuItem: React.FC<{ to: string; label: string; active: boolean }> = ({ to, label, active }) => (
    <NavLink
        to={to}
        className={active ? "nav-link active" : "nav-link"}
        style={{ fontWeight: 800, color: active ? 'var(--color-accent)' : '#111' }}
    >
        {label}
    </NavLink>
);

export default Header;
