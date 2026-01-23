import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', marginTop: '2rem' }}>شرط ۽ ضابطا</h1>
            <div style={{ lineHeight: 1.8, fontSize: '1rem', color: '#444' }}>
                <p style={{ marginBottom: '1rem' }}>
                    تضاد استعمال ڪندي، توهان هيٺين شرطن تي عمل ڪرڻ جا پابند آهيو:
                </p>
                <ul style={{ listStyleType: 'disc', paddingRight: '1.5rem' }}>
                    <li>سائيٽ جو مواد بغير اجازت ڪمرشل مقصدن لاءِ استعمال نٿو ڪري سگهجي.</li>
                    <li>تبصرن ۾ اخلاقي حدن جو خيال رکڻ لازمي آهي.</li>
                    <li>انتظاميه ڪنهن به وقت مواد تبديل يا ختم ڪرڻ جو حق رکي ٿي.</li>
                </ul>
            </div>
        </div>
    );
};

export default Terms;
