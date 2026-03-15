import { HesudharPipeline } from './HesudharPipeline';

// Mock WordNet/Dictionary for v3.0 testing
const mockWordNet: Record<string, string> = {
  "ڳالھيون": "ڳالھيون", // "Talks" uses actual Lam aspiration
  "سگھن": "سگھن",       // "They can" uses actual Gaf aspiration
  "سگھ": "سگھ",         // "Strength" uses actual Gaf aspiration (word-final)
  "جھ": "جھ",           // Core trigraph collapse test relies on WordNet
};

const pipeline = new HesudharPipeline((word) => mockWordNet[word] || null);

function test(name: string, input: string, expected: string) {
  const result = pipeline.process(input);
  if (result.correctedText === expected) {
    console.log(`✅ PASS: ${name}`);
  } else {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Input:    ${input}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${result.correctedText}`);
  }
}

console.log("Starting HESUDHAR 4-Phase Verification Tests...");

// 1. Kaf/Keheh Normalization (Phase 2)
test("Arabic Kaf to Swash Kaf (Book)", "ڪتاب", "ڪتاب"); 
test("Arabic Kaf to Swash Kaf (Loanword)", "كتاب", "ڪتاب"); 
test("Kaf to Keheh (Aspirated context)", "کڻڻ", "کڻڻ"); 
test("Postposition 'khi' standardization", "کي", "کي");

// 2. Yeh Standardization (Phase 2)
test("Farsi Yeh to Dotted Yeh", "علي", "علي");
test("Urdu style dotless Yeh", "ی", "ي");

// 3. Three-Way Heh Disambiguation (Phase 3)
test("Malfoozi: Is (آهي)", "آھي", "آهي"); 
test("Malfoozi: Negative (ناهي)", "ناھي", "ناهي"); 
test("Malfoozi: Ten (ڏه)", "ڏھ", "ڏه");    
test("Visargi: Strength (سگھ)", "سگھ", "سگھ"); 
test("Mukhtafi (Waning): Also (به)", "به", "به"); // Updated to new standard
test("Mukhtafi (Waning): Besides (علاوە)", "علاوھ", "علاوهہ"); 
test("Mukhtafi (Waning): Official (باضابطہ)", "باضابطه", "باضابطهہ");
test("Final Pronounced: Fire (باہ)", "باہه", "باه");   

// 4. Atomic Normalization & Trigraph Collapse (Phase 1)
test("Atomic Alef Madda", "\u0627\u0653", "\u0622");
test("Atomic Yeh Hamza", "\u064A\u0654", "\u0626");
test("Trigraph Collapse (جھہ -> جھ)", "جھہ", "جھ"); // Resolves correctly via WordNet
test("Trigraph Collapse (تباھہ -> تباھ)", "تباھہ", "تباھ"); // Hits the PRESERVE rule (ب is not a trigger)

// 5. Specific Word Corrections Reference (Mansour 2023)
test("Initial Heh (Heh)", "ھڪ", "هڪ");
test("Medial Heh (Important)", "اھم", "اهم");
test("Medial Heh (Known Aspirate via WordNet)", "سگھن", "سگھن"); // WordNet lookup preserves aspiration
test("Medial Heh (Unknown word defaults to Pronounced)", "مگھن", "مگهن"); // v3.0 feature: unknown word defaults to U+0647
test("Initial Implosive Override (Ten)", "ڏھ", "ڏه");
test("Semantic Minimal Pair: Home (Malfoozi)", "گھر", "گهر"); // Input was aspirated, output is Malfoozi because it's in the whitelist
test("Semantic Minimal Pair: Home Plural", "گهرن", "گهرن");

// 5.5 Word-Final Weak Heh (Mukhtafi)
test("Final Weak Heh: West (اولهہ)", "اولھ", "اولهہ");
test("Final Weak Heh: Particle (به)", "بھ", "به");

// 6. Post-Processing Fixes (Phase 4)
test("Lam Aspiration Patch (ڳالہ -> ڳالھ)", "ڳالہ", "ڳالھ");
test("Lam Aspiration Patch (ٻولہ -> ٻولھ)", "ٻولہ", "ٻولھ");
test("Standalone particle نھ -> نہ", "نھ", "نہ");

// 7. Large Text Verification
const sampleInput = `اڳوڻي وفاقي وزير ۽ اڳوڻي صدر پرويز مشرف جي ترجمان رھي چڪي ماروي ميمڻ جي سياسي سرگرمين بابت ھڪ ڀيرو ٻيھر بحث شروع ٿي ويو آھي. تازو ڪراچي جي علائقي ڊي ايڇ اي فيز 8 ۾ ٿيل ھڪ لڳ ڳ پنج ڪلاڪن تي ٻڌل بند ڪمري واري ملاقات کانپوءِ سياسي حلقن ۾ سندس ممڪن واپسي بابت ڳالھيون تيز ٿي ويون آھن.`;
const expectedOutput = `اڳوڻي وفاقي وزير ۽ اڳوڻي صدر پرويز مشرف جي ترجمان رهي چڪي ماروي ميمڻ جي سياسي سرگرمين بابت هڪ ڀيرو ٻيهر بحث شروع ٿي ويو آهي. تازو ڪراچي جي علائقي ڊي ايڇ اي فيز 8 ۾ ٿيل هڪ لڳ ڳ پنج ڪلاڪن تي ٻڌل بند ڪمري واري ملاقات کانپوءِ سياسي حلقن ۾ سندس ممڪن واپسي بابت ڳالھيون تيز ٿي ويون آهن.`;

test("Large-scale Phonetic Normalization Test", sampleInput, expectedOutput);

console.log("Tests completed.");
