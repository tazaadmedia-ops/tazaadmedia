import { HesudharPipeline } from './HesudharPipeline';

const pipeline = new HesudharPipeline(() => null); // No dictionary needed for this snippet

const input = `ڪراچي پريس ڪلب ٻاهران جبري گمشدگين خلاف وائس فار مسنگ پرسنز آف سنڌ (وي ايم پي) پاران لڳايل احتجاجي ڪئمپ دوران ڪيترن ئي ڪارڪنن ۽ وڪيلن جي گرفتاري جون رپورٽون سامھون آيون آھن.

مختلف ذريعن ۽ سوشل ميڊيا تي جاري بيانن موجب، پوليس ۽ سول ڪپڙن ۾ موجود اهلڪارن ڪارروائي ڪندي وي ايم پي سربراهھ سورٺ لوهار، سندس ڌيءَ ڀومي، سينيئر وڪيل ايڊووڪيٽ پرويز آزاد، ايڊووڪيٽ شمس چانڊيو، مرڪ شر، امان بشيران زهراڻي ۽ فرمان زهراڻي سميت ٻين ڪارڪنن کي پنهنجي تحويل ۾ ورتو.

شاهدن جو چوڻ آھي ته احتجاجي ڪئمپ کي به ختم ڪيو ويو، جڏهن ته ڪراچي پريس ڪلب مان کنڀيل ماڻھن جي موجودگي بابت واضح ڄاڻ نه ملي سگهي. ٻئي پاسي، ڪجهه سياسي ۽ سماجي تنظيمن هن ڪارروائي جي مذمت ڪندي گرفتار ٿيل ماڻهن جي فوري آزادي جو مطالبو ڪيو آھي.

اختيارين طرفان هن واقعي بابت باضابطه موقف جاري ٿيڻ باقي آھي، جڏهن ته صورتحال بابت وڌيڪ تفصيل سامھون اچڻ جو امڪان آھي.`;

// Note: I modified some characters in input to match common "unnormalized" forms (using ھ instead of ه)
// to see if the pipeline fixes them.

const result = pipeline.process(input);
console.log("--- Normalized Output ---");
console.log(result.correctedText);
console.log("-------------------------");

// Character checks for the key words
const checks = [
    { word: "سامهون", expectedHex: "0633 0627 0645 0647 0648 0646" },
    { word: "آهن", expectedHex: "0622 0647 0646" },
    { word: "آهي", expectedHex: "0622 0647 064A" },
    { word: "سربراهه", expectedHex: "0633 0631 0628 0631 0627 0647 0647" },
    { word: "ماڻهن", expectedHex: "0645 0627 06BB 0647 0646" },
    { word: "ته", expectedHex: "062A 06C1" },
    { word: "به", expectedHex: "0628 06C1" },
    { word: "نه", expectedHex: "0646 06C1" },
    { word: "باضابطه", expectedHex: "0628 0627 0636 0627 0628 0637 06C1" },
    { word: "کي", expectedHex: "06A9 064A" },
];

let allPassed = true;
for (const check of checks) {
    const parts = result.correctedText.split(/\s+/);
    const found = parts.find(p => p.startsWith(check.word));
    if (found) {
        const hex = Array.from(found.substring(0, check.word.length)).map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
        if (hex === check.expectedHex.replace(/\s/g, '')) {
             // console.log(`✅ ${check.word}: MATCH`);
        } else if (hex.startsWith(check.expectedHex.replace(/\s/g, ''))) {
             console.log(`✅ ${check.word}: MATCH`);
        } else {
            console.log(`❌ ${check.word}: FAIL`);
            console.log(`   Expected: ${check.expectedHex}`);
            console.log(`   Actual:   ${hex}`);
            allPassed = false;
        }
    } else {
        console.log(`❓ ${check.word}: NOT FOUND`);
        allPassed = false;
    }
}

if (allPassed) {
    console.log("ALL SNIPPET CHECKS PASSED!");
}
