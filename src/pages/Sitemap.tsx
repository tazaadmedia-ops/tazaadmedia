import React from 'react';
import { Link } from 'react-router-dom';

const Sitemap: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', marginTop: '2rem' }}>سائيٽ ميپ</h1>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1rem' }}>
                    <Link to="/" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>هوم پيج</Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <Link to="/about" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>اسان بابت</Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <Link to="/submit" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>ليک موڪليو</Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <Link to="/contact" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>رابطو</Link>
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <Link to="/search" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#000', textDecoration: 'none' }}>ڳولا ڪريو</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sitemap;
