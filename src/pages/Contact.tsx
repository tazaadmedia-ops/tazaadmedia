import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Contact: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;

        setStatus('submitting');
        try {
            const { error } = await supabase
                .from('contact_submissions')
                .insert([{ name, email, message }]);

            if (error) throw error;

            setStatus('success');
            setName('');
            setEmail('');
            setMessage('');
        } catch (error: any) {
            console.error('Error submitting form:', error);
            setStatus('error');
            setErrorMessage(error.message || 'ڪجهه غلط ٿي ويو، ٻيهر ڪوشش ڪريو.');
        }
    };

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

                    {status === 'success' ? (
                        <div style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                            <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>توهان جي مهرباني! اسان کي توهان جو پيغام ملي ويو آهي.</p>
                            <button onClick={() => setStatus('idle')} style={{ marginTop: '1rem', background: 'none', border: 'underline', cursor: 'pointer', fontSize: '0.9rem', color: '#047857' }}>
                                ٻيهر لکو
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>نالو</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="توهان جو نالو"
                                    required
                                    disabled={status === 'submitting'}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>اي ميل</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                    disabled={status === 'submitting'}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>پيغام</label>
                                <textarea
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="توهان جو پيغام..."
                                    required
                                    disabled={status === 'submitting'}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                                ></textarea>
                            </div>

                            {status === 'error' && (
                                <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>{errorMessage}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                style={{
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    padding: '0.75rem 2rem',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: status === 'submitting' ? 'wait' : 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    width: '100%',
                                    opacity: status === 'submitting' ? 0.7 : 1
                                }}
                            >
                                {status === 'submitting' ? 'موڪلي رهيو آهي...' : 'موڪليو'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
