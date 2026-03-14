import { SindhiUnicode } from './SindhiUnicode';

/**
 * Core phonetic disambiguation engine.
 * Ported from Hesudhar PHP/Python Reference Implementation.
 */
export class Phase2HehDisambiguator {
  /**
   * Words where Heh is always Malfoozi (Syllable Onset), not Aspiration.
   */
  private static readonly MALFOOZI_WHITELIST = [
    'آهي', 'آهن', 'هيو', 'هئا', 'هئي', 'هيون', // Be verbs
    'رهي', 'رهن', 'رھي', 'رھن', 'رهندڙ',         // Progress verbs
    'هن', 'جنهن', 'هنن', 'هي', 'هو', 'هئن',      // Pronouns & Demonstratives
    'پنهنجو', 'پنهنجي', 'پنھنجو', 'پنھنجي', 'پنهنجا', // Reflexive
    'ڪنهن', 'ڪنھن',                             // Interrogative
    'انهن', 'انھن',                             // Demonstrative
    'انتهائي', 'هڪ', 'هوءَ', 'رها', 'هزار',      // Others
    'باهه', 'جھه',                             // Collapsed tail-hacks
    'سامهون', 'سامھون', 'ماڻهن', 'ماڻھن',       // Syllable onsets
    'رهائشگاهه',                                // From snippet
  ];

  /**
   * Process a single Sindhi word token.
   */
  public processWord(word: string): string {
    if (!word) {
      return word;
    }

    // Skip words that are purely non-Arabic script
    if (!this.isArabicScript(word)) {
      return word;
    }

    // -- RULE 0: MALFOOZI WHITELIST -----------------------------------
    // If the word (normalized to canonical HEH_ARABIC) is in the whitelist,
    // we force it to follow the whitelist's specific variant (standardized here to U+0647).
    const cleanWord = word.trim();
    let canonical = cleanWord;
    for (const h of SindhiUnicode.HEH_VARIANTS) {
      canonical = canonical.split(h).join(SindhiUnicode.HEH_ARABIC);
    }

    if (Phase2HehDisambiguator.MALFOOZI_WHITELIST.includes(canonical)) {
      let corrected = word;
      for (const h of SindhiUnicode.HEH_VARIANTS) {
        corrected = corrected.split(h).join(SindhiUnicode.HEH_ARABIC);
      }
      return corrected;
    }

    const chars = Array.from(word);
    const n = chars.length;

    for (let i = 0; i < n; i++) {
      const char = chars[i];

      if (!SindhiUnicode.HEH_VARIANTS.includes(char)) {
        continue;
      }

      // Determine position and context
      const isWordFinalResult = this.isWordFinal(chars, i, n);
      const prevChar = this.getPrevMeaningfulChar(chars, i);
      const hasVowelBetweenResult = this.hasVowelBetween(chars, i);

      // -- RULE 1: IMPLOSIVE RULE (Dr. Jokhio) --------------------------
      // Implosives CANNOT aspirate -> Heh after implosive = Malfoozi
      if (prevChar && SindhiUnicode.IMPLOSIVES.includes(prevChar)) {
        chars[i] = SindhiUnicode.HEH_ARABIC; // ه U+0647
        continue;
      }

      // -- RULE 2: ASPIRATION CHECK -------------------------------------
      // If a Heh follows an aspiration-triggering consonant AND
      // no vowel diacritic separates them. Covers both medial and final.
      // EXCEPTION: Noon (N) at word-end is silent/weak (Mukhtafi), not aspirated.
      if (
        prevChar &&
        SindhiUnicode.ASPIRATION_TRIGGERS.includes(prevChar) &&
        !hasVowelBetweenResult &&
        !(prevChar === "\u0646" && isWordFinalResult)
      ) {
        chars[i] = SindhiUnicode.HEH_DOACHASHMEE; // ھ U+06BE
        continue;
      }

      // -- RULE 3: WORD-FINAL SOUND ------------------------------------
      // Most word-final Heh sounds in high-quality Sindhi (Mansour 2023) 
      // are forced to U+0647 (Malfoozi/Pronounced).
      // Waning releases (ba, ta, na) are handled in Phase 3.
      if (isWordFinalResult) {
        chars[i] = SindhiUnicode.HEH_ARABIC; // ه U+0647
        continue;
      }

      // -- RULE 4: DEFAULT — MALFOOZI (Syllable Onset) ------------------
      chars[i] = SindhiUnicode.HEH_ARABIC; // ه U+0647
    }

    return chars.join('');
  }

  private isArabicScript(word: string): boolean {
    return /[\u0600-\u06FF\u0750-\u077F]/u.test(word);
  }

  private isWordFinal(chars: string[], i: number, n: number): boolean {
    for (let j = i + 1; j < n; j++) {
      if (!SindhiUnicode.VOWEL_DIACRITICS.includes(chars[j])) {
        return false;
      }
    }
    return true;
  }

  private getPrevMeaningfulChar(chars: string[], i: number): string | null {
    for (let j = i - 1; j >= 0; j--) {
      if (!SindhiUnicode.VOWEL_DIACRITICS.includes(chars[j])) {
        return chars[j];
      }
    }
    return null;
  }

  private hasVowelBetween(chars: string[], i: number): boolean {
    for (let j = i - 1; j >= 0; j--) {
      if (SindhiUnicode.VOWEL_DIACRITICS.includes(chars[j])) {
        return true;
      }
      break;
    }
    return false;
  }
}
