import React from 'react';

const About: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', marginTop: '2rem' }}>اسان بابت</h1>
            <div style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#333' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                    تضاد (Tazaad) هڪ آزاد ۽ نئين سوچ رکندڙ ڊجيٽل ميڊيا پليٽ فارم آهي، جيڪو سنڌي صحافت ۾ هڪ نئون ۽ منفرد آواز بڻجڻ جو عزم رکي ٿو. اسان جو مقصد خبرن، تجزين، ۽ راين ذريعي پنهنجي پڙهندڙن کي باخبر رکڻ ۽ انهن جي شعور کي اجاگر ڪرڻ آهي.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                    اسان يقين رکون ٿا ته صحافت رڳو خبر پهچائڻ ناهي، پر سماج جي انهن رخن کي سامهون آڻڻ آهي جيڪي اڪثر نظرانداز ڪيا ويندا آهن. اسان جي ٽيم تجربيڪار ۽ پرجوش ليکڪن، تجزيه نگارن، ۽ صحافين تي مشتمل آهي جيڪي حقيقت تي مبني مواد تيار ڪرڻ لاءِ ڏينهن رات ڪم ڪن ٿا.
                </p>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>اسان جو مشن</h2>
                <p style={{ marginBottom: '1.5rem' }}>
                    اسان جو مشن سنڌي ٻوليءَ ۾ اعليٰ معيار جو صحافتي مواد فراهم ڪرڻ آهي، جيڪو عالمي معيارن سان مقابلو ڪري سگهي. اسان سياسي، سماجي، ۽ ثقافتي معاملن تي ايمانداري ۽ بي باڪي سان رپورٽنگ ۾ يقين رکون ٿا.
                </p>
            </div>
        </div>
    );
};

export default About;
