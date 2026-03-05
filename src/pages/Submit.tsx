import React from 'react';

const Submit: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', marginTop: '2rem' }}>ليک موڪليو</h1>

            <div style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#333' }}>
                <p style={{ marginBottom: '2rem' }}>
                    تضاد (Tazaad) تي اسان نون ۽ تجربيڪار ليکڪن کي ڀليڪار چئون ٿا. جيڪڏهن توهان وٽ ڪو منفرد خيال، تجزيو، يا ڪهاڻي آهي، ته اسان سان ونڊ ڪريو.
                </p>

                <section id="rules" style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>قاعدا ۽ ضابطا</h2>
                    <ul style={{ listStyleType: 'disc', paddingRight: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>توهان جو مواد اصل هجڻ گهرجي ۽ اڳ ڪٿي به شايع ٿيل نه هجي.</li>
                        <li>تحرير جي ٻولي معياري سنڌي هجڻ گهرجي.</li>
                        <li>نفرت پکيڙيندڙ، تعصب، يا ڪنهن جي ذاتي زندگي تي حملو ڪندڙ مواد قبول نه ڪيو ويندو.</li>
                        <li>مضمون يا تجزيو 800 کان 1500 لفظن جي وچ ۾ هجڻ گهرجي.</li>
                        <li>حوالا ۽ ذريعا واضح طور تي بيان ٿيڻ گهرجن.</li>
                    </ul>
                </section>

                <section id="how-to">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>موڪلڻ جو طريقو</h2>
                    <p style={{ marginBottom: '1rem' }}>
                        پنهنجي تحرير هيٺ ڏنل اي ميل تي موڪليو. اسان جي ايڊيٽوريل ٽيم توهان جي مواد جو جائزو وٺندي ۽ جيڪڏهن اهو معيار تي پورو لٿو، ته اسان توهان سان رابطو ڪنداسين.
                    </p>
                    <div style={{ padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>tazaadmedia@gmail.com</p>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        مهرباني ڪري اي ميل، سبجيڪٽ ۾ "Submission: [Topic Name]" لکو.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Submit;
