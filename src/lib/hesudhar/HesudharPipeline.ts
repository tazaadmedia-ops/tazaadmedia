import { Phase1AtomicNormalization } from './Phase1AtomicNormalization';
import { Phase2GlobalStandardization } from './Phase2GlobalStandardization';
import { Phase3HehDisambiguator } from './Phase3HehDisambiguator';
import { Phase4WordNetValidation } from './Phase4WordNetValidation';
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
 * Master pipeline for the HESUDHAR Sindhi text normalization engine.
 * Based on the 4-phase formal specification.
 */
export class HesudharPipeline {
  private phase1 = new Phase1AtomicNormalization();
  private phase2 = new Phase2GlobalStandardization();
  private phase3 = new Phase3HehDisambiguator();
  private phase4 = new Phase4WordNetValidation();
  private citationDetector = new ArabicCitationDetector();
  private dictionaryLookup?: (word: string) => string | null;

  constructor(dictionaryLookup?: (word: string) => string | null) {
    this.dictionaryLookup = dictionaryLookup;
    this.phase4 = new Phase4WordNetValidation(dictionaryLookup);
  }

  /**
   * Full 4-Phase Pipeline Execution.
   */
  public process(text: string): HesudharResult {
    const result: HesudharResult = {
      originalText: text,
      correctedText: '',
      changesLog: []
    };

    // -- PHASE 1: Atomic Pre-processing (Unicode Cleanup) --
    let processedText = this.phase1.run(text);

    // -- Tokenize into words --
    const tokens = this.tokenize(processedText);
    const correctedTokens: string[] = [];

    for (const token of tokens) {
      const originalToken = token;

      // Skip non-Sindhi tokens
      if (!this.isSindhiWord(token)) {
        correctedTokens.push(token);
        continue;
      }

      // -- PHASE 0: Pre-flight Dictionary Override --
      // If the admin defined a manual hotfix for this word, use it directly and skip algorithmic phases.
      if (this.dictionaryLookup) {
        const lookup = this.dictionaryLookup(token);
        if (lookup && lookup !== token) {
            result.changesLog.push({
              original: token,
              corrected: lookup,
              source: 'ALGORITHM'
            });
            correctedTokens.push(lookup);
            continue;
        } else if (lookup === token) {
            correctedTokens.push(token);
            continue;
        }
      }

      // -- Arabic Citation Bypassing (Ref 3.1.2) --
      const isArabic = this.citationDetector.isArabicCitation(token);

      // -- PHASE 2: Global Character Standardization (Kaf, Yeh, Alef) --
      let correctedToken = this.phase2.run(token);

      // -- PHASE 3: Heh Phonetic Disambiguation --
      correctedToken = this.phase3.processWord(correctedToken, isArabic);

      // -- PHASE 4: WordNet Validation + Feedback --
      this.phase4.validate(correctedToken);
      // Future: handle candidate logging in validation.

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
    const pattern = /([^\s\u06D4\u060C\u061F!.,;:()\[\]"']+|[\s\u06D4\u060C\u061F!.,;:()\[\]"']+)/gu;
    return text.match(pattern) || [text];
  }

  private isSindhiWord(token: string): boolean {
    return /[\u0600-\u06FF]/u.test(token);
  }
}
