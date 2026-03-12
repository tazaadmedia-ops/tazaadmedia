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
     * Arabic ك (U+0643) -> Sindhi ڪ (U+06AA) for native unaspirated /k/.
     */
    return word.split(SindhiUnicode.KAF_ARABIC).join(SindhiUnicode.KAF_SINDHI_SWASH);
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
