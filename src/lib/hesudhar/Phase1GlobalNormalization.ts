import { SindhiUnicode } from './SindhiUnicode';

/**
 * Pre-process entire text before word-level analysis.
 * Ported from Hesudhar PHP/Python Reference Implementation.
 */
export class Phase1GlobalNormalization {
  public run(text: string): string {
    text = this.nfcNormalize(text);
    text = this.collapseAlefMadda(text);
    text = this.collapseTrigraphHacks(text);
    text = this.normalizeYeh(text);
    text = this.normalizeHehGoalHamza(text);
    text = this.normalizeHamza(text);
    text = this.normalizeKaf(text);
    return text;
  }

  private nfcNormalize(text: string): string {
    // String.prototype.normalize is built-in in modern JS
    return text.normalize('NFC');
  }

  private collapseAlefMadda(text: string): string {
    return text.split(SindhiUnicode.ALEF_MADDA_SEQ).join(SindhiUnicode.ALEF_MADDA);
  }

  private collapseTrigraphHacks(text: string): string {
    /**
     * HISTORICAL CONTEXT (Mansour 2023): Trigraph Hacks.
     * Legacy systems added a "tail" (ہ) to aspirated consonants in the final position.
     * Action: Collapse <U+06BE (Aspirate) + U+06C1 (Weak Heh)> into just <U+06BE>.
     */
    const trigraphPattern = /\u06BE\u06C1/gu;
    text = text.replace(trigraphPattern, "\u06BE");

    /**
     * Also collapse multiple consecutive Hehs at word boundaries (general cleanup).
     */
    const pattern = /([\u0647\u06BE\u06C1\u06C2\u06D5\u06C0]){2,}(?=[\s\u06D4\u060C\u061F!.,;:()\[\]"']|$)/gu;
    return text.replace(pattern, "$1");
  }

  private normalizeYeh(text: string): string {
    // Preserve Alef Maqsura (U+0649) as it is reserved for Arabic loanwords.
    return text.split(SindhiUnicode.YEH_FARSI).join(SindhiUnicode.YEH_ARABIC);
  }

  private normalizeHehGoalHamza(text: string): string {
    return text.split(SindhiUnicode.HEH_GOAL_HAMZA).join(SindhiUnicode.HEH_GOAL);
  }

  private normalizeKaf(text: string): string {
    // Normalize Arabic Kaf (U+0643) to Sindhi Swash Kaf (U+06AA)
    // Keheh (U+06A9) is preserved for specific phonetic contexts (like 'kh' or 'khi').
    return text.split(SindhiUnicode.KAF_ARABIC).join(SindhiUnicode.KAF_SINDHI_SWASH);
  }

  private normalizeHamza(text: string): string {
    // Mandatory Atomic Normalization (Evans 2021)
    // Convert YEH_HAMZA_SEQ <U+064A, U+0654> into YEH_HAMZA_ATOMIC <U+0626>
    return text.split(SindhiUnicode.YEH_HAMZA_SEQ).join(SindhiUnicode.YEH_HAMZA_ATOMIC);
  }
}
