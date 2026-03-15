import { SindhiUnicode } from './SindhiUnicode';

/**
 * PHASE 3: Heh Phonetic Disambiguation (Core Engine)
 * Based on: Mansour (2023), Dr. Altaf Jokhio.
 */
export class Phase3HehDisambiguator {
  /**
   * Words where Heh is always Malfoozi (Syllable Onset), not Aspiration.
   */
  private static readonly MALFOOZI_WHITELIST = [
    'رهي', 'رهن', 'رھي', 'رھن', 'رهندڙ',         // Progress verbs
    'آهي', 'آهن', 'ناهي', 'ناهن', 'هيو', 'هئا', 'هئي', 'هيون', // Verbs
    'هن', 'جنهن', 'هنن', 'هي', 'هو', 'هئن',      // Pronouns & Demonstratives
    'پنهنجو', 'پنهنجي', 'پنھنجو', 'پنھنجي', 'پنهنجا', // Reflexive
    'ڪنهن', 'ڪنھن',                             // Interrogative
    'انهن', 'انھن',                             // Demonstrative
    'انتهائي', 'هڪ', 'هوءَ', 'رها', 'هزار',      // Others
    'باهه', 'جھه',                             // Legacy hacks (before collapse)
    'سامهون', 'سامھون', 'ماڻهن', 'ماڻھن',       // Syllable onsets
    'رهائشگاهه',                                // From snippet
    'گهر', 'گهرن', 'گهران', 'گهرو',             // Semantic minimal pair for "Home" (vs گھر meaning Jalebi)
    'ته', 'هميشه', 'موجوده', 'زنده', 'جڳهه',     // v3.2 Particles & Loanwords (Single Heh standard)
  ];

  /**
   * Words that specifically use a Weak Heh (Mukhtafi) despite phonetic triggers.
   */
  private static readonly MUKHTAFI_WHITELIST = [
    'علاوه', 'هونداهوا', 'هئا', 'به', 'ته', 'هميشه', 'موجوده', 'زنده', 'جڳهه'
  ];

  public processWord(word: string, isArabicCitation: boolean = false): string {
    if (!word || isArabicCitation) return word;

    // -- 3.0: Unify to generic HEH_ARABIC for uniform rule application
    let workWord = word;
    for (const h of SindhiUnicode.HEH_VARIANTS) {
      workWord = workWord.split(h).join(SindhiUnicode.HEH_ARABIC);
    }

    // -- RULE 0: Whitelist check
    if (Phase3HehDisambiguator.MALFOOZI_WHITELIST.includes(workWord)) {
      return workWord; 
    }

    // -- RULE 0.1: Mukhtafi Whitelist
    if (Phase3HehDisambiguator.MUKHTAFI_WHITELIST.includes(workWord)) {
      if (workWord === 'به') {
        return 'به'; // User explicit exception for particle "ba"
      }
      
      const resultChars = Array.from(word);
      if (resultChars.length > 0 && SindhiUnicode.HEH_VARIANTS.includes(resultChars[resultChars.length - 1])) {
        // Strip the old variant and append the new 3.0 standard: هہ
        return word.substring(0, word.length - 1) + SindhiUnicode.HEH_ARABIC + SindhiUnicode.HEH_GOAL;
      }
      return resultChars.join('');
    }

    const chars = Array.from(word);
    const n = chars.length;
    const resultChars = [...chars];

    for (let i = 0; i < n; i++) {
      if (!SindhiUnicode.HEH_VARIANTS.includes(chars[i])) continue;

      const isFinal = this.isWordFinal(chars, i);
      const prevChar = this.getPrevMeaningfulChar(chars, i);
      const hasVowel = this.hasVowelBetween(chars, i);

      // -- 3.1.1: Implosive Override (Dr. Jokhio)
      if (prevChar && SindhiUnicode.IMPLOSIVES.includes(prevChar)) {
        resultChars[i] = SindhiUnicode.HEH_ARABIC;
        continue;
      }

      // -- 3.1.2: PRESERVE post-collapse terminal aspirate
      // If the character is already U+06BE, is word-final, and is NOT preceded by a trigger, preserve it.
      // (This catches genuine terminal aspirates like تباھ and گروھ that survived Phase 1)
      if (chars[i] === SindhiUnicode.HEH_DOACHASHMEE && isFinal && 
          prevChar && !SindhiUnicode.ASPIRATION_TRIGGERS.includes(prevChar)) {
        resultChars[i] = SindhiUnicode.HEH_DOACHASHMEE;
        continue;
      }

      // -- 3.2: RULE B - WEAK / SILENT HEH (Word-final only)
      if (isFinal) {
        // Only force Malfoozi if preceded by vowel or implosive
        const isVowelPrior = prevChar && (
          prevChar === SindhiUnicode.ALEF_PLAIN || 
          prevChar === SindhiUnicode.ALEF_MADDA ||
          hasVowel
        );
        
        // Specific Word Checks based on incoming new standards (اولهہ, به)
        if (workWord === 'اوله') {
          return workWord.substring(0, workWord.length - 1) + SindhiUnicode.HEH_ARABIC + SindhiUnicode.HEH_GOAL; // اولهہ
        }

        if (isVowelPrior) {
          resultChars[i] = SindhiUnicode.HEH_ARABIC;
        } else {
          resultChars[i] = SindhiUnicode.HEH_ARABIC + SindhiUnicode.HEH_GOAL; // Fallback to هہ for all word-final waning breaths
        }
        continue;
      }

      // -- 3.3: RULE C - PRONOUNCED (DEFAULT FOR UNKNOWN WORDS)
      // v3.0 Critical Correction: Do NOT automatically assign aspiration (U+06BE) here.
      // Trigger+Heh is a semantic minimal pair (e.g., گهر vs گھر).
      // For unknown words, U+0647 is the safest default to prevent meaning destruction.
      resultChars[i] = SindhiUnicode.HEH_ARABIC;
    }

    return resultChars.join('');
  }

  private isWordFinal(chars: string[], i: number): boolean {
    for (let j = i + 1; j < chars.length; j++) {
      if (!SindhiUnicode.VOWEL_DIACRITICS.includes(chars[j])) return false;
    }
    return true;
  }

  private getPrevMeaningfulChar(chars: string[], i: number): string | null {
    for (let j = i - 1; j >= 0; j--) {
      if (!SindhiUnicode.VOWEL_DIACRITICS.includes(chars[j])) return chars[j];
    }
    return null;
  }

  private hasVowelBetween(chars: string[], i: number): boolean {
    if (i === 0) return false;
    return SindhiUnicode.VOWEL_DIACRITICS.includes(chars[i - 1]);
  }
}
