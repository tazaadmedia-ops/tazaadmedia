import React from 'react';
import SEO from '../components/SEO';

const AboutPage: React.FC = () => {
    return (
        <div className="container page-top-margin" style={{ fontFamily: 'var(--font-main)', direction: 'rtl', paddingBottom: '5rem' }}>
            <SEO
                title="اسان بابت - About Us"
                description="Tazaad (تضاد) is a leading Sindhi digital media platform. تضاد سنڌي ٻوليءَ جو هڪ اهم ڊجيٽل ميڊيا پليٽ فارم آهي."
                slug="about"
            />

            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, marginBottom: '1rem' }}>اسان بابت</h1>
                <div style={{ fontSize: '1.2rem', color: '#666', fontWeight: 500 }}>About Tazaad</div>
            </header>

            <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: 1.8, fontSize: '1.2rem', color: '#333' }}>
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', borderRight: '5px solid var(--color-accent)', paddingRight: '1rem' }}>تعارف (Introduction)</h2>
                    <p>
                        تضاد (Tazaad) سنڌي ٻوليءَ جو هڪ آزاد ۽ خودمختار ڊجيٽل ميڊيا پليٽ فارم آهي، جنهن جو مقصد سنڌي عوام کي تازين خبرن، کوجنا ڪندڙ رپورٽن ۽ معيار واري تجزيي سان باخبر رکڻ آهي. اسان جو عزم آهي ته اسان سماجي، سياسي ۽ ثقافتي معاملن تي بغير ڪنهن فرق جي آواز اٿاريون.
                    </p>
                    <p style={{ marginTop: '1.5rem', direction: 'ltr', textAlign: 'left', borderLeft: '3px solid #eee', paddingLeft: '1.5rem', color: '#666' }}>
                        Tazaad is an independent Sindhi-language digital media platform dedicated to providing the latest news, investigative reporting, and high-quality analysis. Our mission is to amplify voices on social, political, and cultural issues with journalistic integrity and independence.
                    </p>
                </section>

                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', borderRight: '5px solid var(--color-accent)', paddingRight: '1rem' }}>اسان جو مقصد (Our Mission)</h2>
                    <ul style={{ paddingRight: '1.5rem', listStyleType: 'square' }}>
                        <li>سنڌي صحافت ۾ جديديت ۽ معيار کي فروغ ڏيڻ.</li>
                        <li>عام ماڻهوءَ جي مسئلن کي اقتدار جي ايوانن تائين پهچائڻ.</li>
                        <li>سنڌي ٻولي، ثقافت ۽ تاريخ جي تحفظ لاءِ لوڪل ۽ گلوبل سطح تي ڪم ڪرڻ.</li>
                    </ul>
                    <ul style={{ marginTop: '1.5rem', direction: 'ltr', textAlign: 'left', borderLeft: '3px solid #eee', paddingLeft: '1.5rem', color: '#666', listStyleType: 'square' }}>
                        <li>To promote modern standards and excellence in Sindhi journalism.</li>
                        <li>To bring the issues of the common person to the corridors of power.</li>
                        <li>To work globally for the protection and promotion of Sindhi language, culture, and history.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', borderRight: '5px solid var(--color-accent)', paddingRight: '1rem' }}>رابطو (Contact)</h2>
                    <p>
                        جيڪڏهن اوهان وٽ ڪا خبر، تجزيو يا پيغام آهي ته اسان سان سوشل ميڊيا يا اي ميل ذريعي رابطو ڪري سگهو ٿا.
                    </p>
                    <p style={{ marginTop: '0.5rem', fontWeight: 700 }}>
                        اي ميل: info@thetazaad.com
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
