import { HesudharPipeline } from './HesudharPipeline';

const pipeline = new HesudharPipeline();

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

console.log("Starting Hesudhar Verification Tests...");

// 1. Kaf Normalization
test("Arabic Kaf to Sindhi Kaf", "ڪتاب", "ڪتاب"); // Already Sindhi Kaf
test("Arabic Kaf to Sindhi Kaf (Correction)", "كتاب", "ڪتاب"); // Should correct

// 2. Heh Disambiguation - Word Final
test("Word Final Heh (Mukhtafi)", "آهي", "آهي"); // Already correct
test("Word Final Heh (Mukhtafi correction)", "آهہ", "آهي"); // This depends on if 'h' is followed by 'i' or if it's absolute final. 
// Actually "آهي" ends with Yeh. 
// Let's try "ته" (teh)
test("Word Final Heh (teh)", "ته", "ته"); // Already correct (U+06C1)
test("Word Final Heh (teh correction)", "تهه", "ته"); // Double Heh at end? Rule 3 applies.

// 3. Aspiration Check
test("Aspiration (kh)", "کلائڻ", "کلائڻ"); // Keheh is used for kh. 
// In Sindhi "ک" (U+06A9) is often used for aspirated K. 
// Wait, the rule says if HEH follows aspiration trigger.
// "ڪ" + "ھ" -> "ک" ? No, Sindhi has unique characters.
// But some people write "ک" as "ڪ" + "ھ".
// Actually modern Sindhi uses atomic "ک" (U+06A9).
// The pipeline handles "ڪ" + "ھ" -> "ھ" (Doachashmee)? No.

// Let's check SindhiUnicode.ASPIRATION_TRIGGERS
// Kaf is NOT in aspiration triggers? 
// Ah, KAF_KEHEH (ک) is U+06A9.

// Let's test "ٻ" (implosive) + Heh -> should be HEH_ARABIC
test("Implosive + Heh", "\u067B\u06BE", "\u067B\u0647"); 

// 4. Global Normalization
test("Yeh Farsi to Yeh Arabic", "یار", "يار"); // ی (U+06CC) -> ي (U+064A)

// 5. Arabic Citation Bypass
test("Arabic Citation", "بسم الله الرحمن الرحيم", "بسم الله الرحمن الرحيم"); // Should remain unchanged

// 6. Regression: Final Heh Goal (Mukhtafi)
test("Teh + Heh Goal", "ته", "ته");
test("Beh + Heh Goal", "به", "به");

console.log("Tests completed.");
