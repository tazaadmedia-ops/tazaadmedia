import { SindhiUnicode } from './SindhiUnicode';

/**
 * Additional character-level corrections beyond Heh.
 * Ported from Hesudhar PHP/Python Reference Implementation.
 */
export class Phase3SecondaryNormalization {
  /**
   * Common loanwords from Arabic where /h/ is pronounced (Malfoozi).
   * These would wrongly trigger aspiration rules without this whitelist.
   */
  public static readonly ARABIC_LOANWORDS_WITH_PRONOUNCED_HEH = [
    'جهاز',
    'جهازن',
    'جهازون',   // ship
    'مهم',
    'مهمن',
    'مهمون',       // important / mission
    'تهران',
    'بغداد',              // city names
    'الله',
    'اللہ',               // Allah
  ];

  public run(word: string): string {
    let result = this.normalizeKaf(word);
    result = this.fixLoanwordHeh(result);
    return result;
  }

  private normalizeKaf(word: string): string {
    /**
     * ACADEMIC STANDARD (Step 2): Velar Stop Normalization.
     * Karachi (unaspirated /k/) -> ڪ (U+06AA).
     * Khann (aspirated /kh/) -> ک (U+06A9).
     */

    // Specific Rule for 'کي' (phonetically aspirated /kʰi/)
    if (word === "\u06AA\u064A" || word === "\u0643\u064A" || word === "\u06A9\u064A") {
      return SindhiUnicode.KAF_KEHEH + SindhiUnicode.YEH_ARABIC;
    }

    /**
     * ACADEMIC STANDARD (Step 3.2): Terminal Weak Sound (Mukhtafi).
     * Represents a "waning release of air" (as in ba, ta, na).
     * Action: Force to U+06C1 (HEH_GOAL).
     */
    if (word === "\u0628\u0647" || word === "\u0628\u06C1" || word === "\u0628\u06BE") {
      return "\u0628" + SindhiUnicode.HEH_GOAL; // بہ
    }
    
    return word;
  }

  private fixLoanwordHeh(word: string): string {
    const cleanWord = word.trim();
    if (Phase3SecondaryNormalization.ARABIC_LOANWORDS_WITH_PRONOUNCED_HEH.includes(cleanWord)) {
      // Replace any aspirated Heh with Malfoozi in these specific words
      return word.split(SindhiUnicode.HEH_DOACHASHMEE).join(SindhiUnicode.HEH_ARABIC);
    }
    return word;
  }
}
