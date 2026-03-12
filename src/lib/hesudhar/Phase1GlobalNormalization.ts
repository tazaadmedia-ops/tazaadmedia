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
     * Historically, extra Heh variants (ہ, ه, ە) were used as "visual tails".
     * Collapse multiple consecutive Hehs at word boundaries into a single Heh.
     * Phase 2 will then force the correct phonetic variant.
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
}
