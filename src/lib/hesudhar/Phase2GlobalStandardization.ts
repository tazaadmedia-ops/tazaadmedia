import { SindhiUnicode } from './SindhiUnicode';

/**
 * PHASE 2: Global Character Standardization (Kaf, Yeh, Alef)
 * Based on: SIL/Evans (2021), Kew (2005).
 */
export class Phase2GlobalStandardization {
  public run(word: string): string {
    let result = word;
    
    // 2.1 Yeh Standardization (Force dotted Yeh in all positions)
    result = this.normalizeYeh(result);
    
    // 2.2 Kaf Standardization (Arabic Kaf contextual replacement)
    result = this.normalizeKaf(result);
    
    return result;
  }

  private normalizeYeh(word: string): string {
    // Force Farsi/Urdu Yeh (U+06CC) to Sindhi-Arabic Yeh (U+064A)
    return word.split(SindhiUnicode.YEH_FARSI).join(SindhiUnicode.YEH_ARABIC);
  }

  private normalizeKaf(word: string): string {
    /**
     * Context-aware replacement of Arabic Kaf (U+0643).
     * Rule: DEFAULT to Swash Kaf (ڪ U+06AA).
     * EXCEPT: If before a Heh-like character or clearly aspirated, use Keheh (ک U+06A9).
     */
    if (!word.includes(SindhiUnicode.KAF_ARABIC)) {
      return word;
    }

    const chars = Array.from(word);
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === SindhiUnicode.KAF_ARABIC) {
        const nextChar = i + 1 < chars.length ? chars[i + 1] : null;
        
        // If followed by Heh variant (e.g., کڻڻ typed with Arabic Kaf)
        // Or specific postposition 'کي' check
        if (nextChar && SindhiUnicode.HEH_VARIANTS.includes(nextChar)) {
          chars[i] = SindhiUnicode.KAF_KEHEH;
        } else if (word === "\u0643\u064A") { // کي
          chars[i] = SindhiUnicode.KAF_KEHEH;
        } else {
          chars[i] = SindhiUnicode.KAF_SINDHI_SWASH;
        }
      }
    }
    
    return chars.join('');
  }
}
