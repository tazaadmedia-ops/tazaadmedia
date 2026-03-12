import { Phase1GlobalNormalization } from './Phase1GlobalNormalization';
import { Phase2HehDisambiguator } from './Phase2HehDisambiguator';
import { Phase3SecondaryNormalization } from './Phase3SecondaryNormalization';
import { ArabicCitationDetector } from './ArabicCitationDetector';

export interface HesudharChange {
  original: string;
  corrected: string;
  source: 'ALGORITHM';
}

export interface HesudharResult {
  originalText: string;
  correctedText: string;
  changesLog: HesudharChange[];
}

/**
 * Master pipeline for the Hesudhar Sindhi text normalization engine.
 * Ported from Hesudhar PHP/Python Reference Implementation.
 */
export class HesudharPipeline {
  private phase1 = new Phase1GlobalNormalization();
  private phase2 = new Phase2HehDisambiguator();
  private phase3 = new Phase3SecondaryNormalization();
  private citationDetector = new ArabicCitationDetector();

  /**
   * Full pipeline execution.
   */
  public process(text: string): HesudharResult {
    const result: HesudharResult = {
      originalText: text,
      correctedText: '',
      changesLog: []
    };

    // -- PHASE 1: Global pre-normalization --
    let processedText = this.phase1.run(text);

    // -- Tokenize into words --
    const tokens = this.tokenize(processedText);
    const correctedTokens: string[] = [];

    for (const token of tokens) {
      const originalToken = token;

      // Skip non-Sindhi tokens (punctuation, numbers, Latin)
      if (!this.isSindhiWord(token)) {
        correctedTokens.push(token);
        continue;
      }

      // -- PHASE 4: Arabic citation bypass --
      if (this.citationDetector.isArabicCitation(token)) {
        correctedTokens.push(token);
        continue;
      }

      // -- PHASE 2: Heh disambiguation --
      let correctedToken = this.phase2.processWord(token);

      // -- PHASE 3: Secondary normalization --
      correctedToken = this.phase3.run(correctedToken);

      // -- Log changes --
      if (correctedToken !== originalToken) {
        result.changesLog.push({
          original: originalToken,
          corrected: correctedToken,
          source: 'ALGORITHM'
        });
      }

      correctedTokens.push(correctedToken);
    }

    result.correctedText = correctedTokens.join('');
    return result;
  }

  private tokenize(text: string): string[] {
    /**
     * Split text into tokens while preserving separators.
     * Pattern: capture everything that's NOT a separator OR capture the separators themselves.
     */
    const pattern = /([^\s\u06D4\u060C\u061F!.,;:()\[\]"']+|[\s\u06D4\u060C\u061F!.,;:()\[\]"']+)/gu;
    return text.match(pattern) || [text];
  }

  private isSindhiWord(token: string): boolean {
    return /[\u0600-\u06FF]/u.test(token);
  }
}
