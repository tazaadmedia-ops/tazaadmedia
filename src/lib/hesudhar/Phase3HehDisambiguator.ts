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
  ];

  /**
   * Words that specifically use a Weak Heh (Mukhtafi) despite phonetic triggers.
   */
  private static readonly MUKHTAFI_WHITELIST = [
    'علاوه', 'هونداهوا', 'هئا',
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
      // Force terminal weak heh if it ends with a heh variant
      const resultChars = Array.from(word);
      if (resultChars.length > 0 && SindhiUnicode.HEH_VARIANTS.includes(resultChars[resultChars.length - 1])) {
        resultChars[resultChars.length - 1] = SindhiUnicode.HEH_GOAL;
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

      // -- 3.1: RULE A - ASPIRATION
      if (
        prevChar &&
        SindhiUnicode.ASPIRATION_TRIGGERS.includes(prevChar) &&
        !hasVowel &&
        !(prevChar === "\u0646" && isFinal) && // Noon word-final edge case
        !(prevChar === "\u0648" && isFinal)    // Waw word-final exception (e.g. अलावा)
      ) {
        resultChars[i] = SindhiUnicode.HEH_DOACHASHMEE;
        continue;
      }

      // -- 3.2: RULE B - WEAK / SILENT HEH
      if (isFinal) {
        // Only force Malfoozi if preceded by vowel or implosive
        const isVowelPrior = prevChar && (
          prevChar === SindhiUnicode.ALEF_PLAIN || 
          prevChar === SindhiUnicode.ALEF_MADDA ||
          hasVowel
        );
        if (isVowelPrior) {
          resultChars[i] = SindhiUnicode.HEH_ARABIC;
        } else {
          resultChars[i] = SindhiUnicode.HEH_GOAL;
        }
        continue;
      }

      // -- 3.3: RULE C - PRONOUNCED (DEFAULT)
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
