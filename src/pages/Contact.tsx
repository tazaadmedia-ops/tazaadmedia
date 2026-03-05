import React from 'react';

const Contact: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', marginTop: '2rem' }}>رابطو ڪريو</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                <div>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        تضاد ٽيم سان رابطي لاءِ، هيٺ ڏنل ذريعا استعمال ڪريو. اسان توهان جي راءِ، تجويزن، ۽ سوالن جو قدر ڪريون ٿا.
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>جنرل انڪوائري</h3>
                        <a href="mailto:tazaadmedia@gmail.com" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>tazaadmedia@gmail.com</a>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>ايڊيٽوريل ٽيم</h3>
                        <a href="mailto:tazaadmedia@gmail.com" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>tazaadmedia@gmail.com</a>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>اشتهارن لاءِ</h3>
                        <a href="mailto:tazaadmedia@gmail.com" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>tazaadmedia@gmail.com</a>
                    </div>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>اسان کي لکو</h3>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>نالو</label>
                            <input type="text" placeholder="توهان جو نالو" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>اي ميل</label>
                            <input type="email" placeholder="example@email.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>پيغام</label>
                            <textarea rows={5} placeholder="توهان جو پيغام..." style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}></textarea>
                        </div>
                        <button type="submit" style={{ backgroundColor: '#000', color: '#fff', padding: '0.75rem 2rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                            موڪليو
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
