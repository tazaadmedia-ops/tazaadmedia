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
     * Pattern: U+06BE (ھ) followed by U+06C1 (ہ), U+06D5 (ە), or U+0647 (ه) at word boundary
     */
    const pattern = /\u06BE[\u06C1\u06D5\u0647](?=[\s\u06D4\u060C\u061F!.,;:()\[\]"']|$)/gu;
    return text.replace(pattern, "\u06BE");
  }

  private normalizeYeh(text: string): string {
    let result = text;
    result = result.split(SindhiUnicode.YEH_FARSI).join(SindhiUnicode.YEH_ARABIC);
    result = result.split(SindhiUnicode.YEH_ARABIC_MAX).join(SindhiUnicode.YEH_ARABIC);
    return result;
  }

  private normalizeHehGoalHamza(text: string): string {
    return text.split(SindhiUnicode.HEH_GOAL_HAMZA).join(SindhiUnicode.HEH_GOAL);
  }
}
