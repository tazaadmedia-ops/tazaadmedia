import React from 'react';

const Privacy: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', marginTop: '2rem' }}>پرائيويسي پاليسي</h1>
            <div style={{ lineHeight: 1.8, fontSize: '1rem', color: '#444' }}>
                <p style={{ marginBottom: '1rem' }}>
                    تضاد (Tazaad) توهان جي ذاتي معلومات جي حفاظت کي اوليت ڏئي ٿو. هي دستاويز بيان ڪري ٿو ته اسان ڪيئن معلومات گڏ ڪريون ٿا ۽ ان جو استعمال ڪيون ٿا.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem' }}>معلومات جو گڏ ڪرڻ</h3>
                <p>
                    اسان ويب سائيٽ جي بهتري لاءِ ڪوڪيز (Cookies) ۽ اينالائيٽڪس (Analytics) استعمال ڪري سگهون ٿا جنهن ذريعي اسان کي پڙهندڙن جي رجحانن جي خبر پوي ٿي.
                </p>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2rem' }}>ٽي ڌريون</h3>
                <p>
                    اسان توهان جي ذاتي معلومات (جيئن اي ميل) ڪنهن به ٽين ڌر سان شيئر نه ڪندا آهيون، سواءِ قانوني گهرجن جي.
                </p>
            </div>
        </div>
    );
};

export default Privacy;
