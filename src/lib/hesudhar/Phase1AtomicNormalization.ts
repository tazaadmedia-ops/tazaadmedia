import { SindhiUnicode } from './SindhiUnicode';

/**
 * PHASE 1: Atomic Pre-processing (Unicode cleanup)
 * Based on: Mansour (2023), SIL/Evans (2021).
 */
export class Phase1AtomicNormalization {
  public run(text: string): string {
    // 1.1 NFC Normalization
    let result = text.normalize('NFC');

    // Atomic Alef Madda check (already handled by NFC, but confirmed here)
    result = result.split(SindhiUnicode.ALEF_MADDA_SEQ).join(SindhiUnicode.ALEF_MADDA);

    // 1.2 Collapse Legacy Trigraph "Tail Hacks" and Multi-Heh groups
    result = this.collapseTrigraphHacks(result);
    result = this.collapseMultiHeh(result);

    return result;
  }

  private collapseMultiHeh(text: string): string {
    /**
     * Collapse multiple consecutive Hehs at word boundaries (general cleanup).
     * Based on: Kew (2005) / spec rules.
     */
    const pattern = /([\u0647\u06BE\u06C1\u06C2\u06D5\u06C0]){2,}(?=[\s\u06D4\u060C\u061F!.,;:()\[\]"']|$)/gu;
    return text.replace(pattern, "$1");
  }

  private collapseTrigraphHacks(text: string): string {
    /**
     * Pattern: [Any consonant] + U+06BE (ھ) + U+06C1/U+06D5 (ہ/ە) at word end.
     * Action: Delete the trailing weak Heh. Digraph is the correct encoding.
     */
    // Handles space, punctuation, or EOL
    const pattern = /(\u06BE)[\u06C1\u06D5](?=[\s\u06D4\u060C\u061F!.,;:()\[\]"']|$)/gu;
    return text.replace(pattern, "$1");
  }
}
