import { SindhiUnicode } from './SindhiUnicode';

/**
 * Detect Arabic religious/literary quotations embedded in Sindhi text.
 * Ported from Hesudhar PHP/Python Reference Implementation.
 */
export class ArabicCitationDetector {
  public static readonly ARABIC_CITATION_MARKERS = [
    'الله',
    'اللہ',
    'بسم',
    'قرآن',
    'سبحان',
    'الرحمن',
    'الرحيم',
    'انا',
    'انّا',
  ];

  public static readonly ARABIC_HARAKAT = [
    "\u064B",
    "\u064C",
    "\u064D",
    "\u064E",
    "\u064F",
    "\u0650",
    "\u0651",
    "\u0652"
  ];

  public isArabicCitation(word: string): boolean {
    // Check for known Arabic markers
    for (const marker of ArabicCitationDetector.ARABIC_CITATION_MARKERS) {
      if (word.includes(marker)) {
        return true;
      }
    }

    // Check for Arabic diacritics (Harakat) — very rare in Sindhi writing
    let harakatCount = 0;
    const chars = Array.from(word);
    for (const ch of chars) {
      if (ArabicCitationDetector.ARABIC_HARAKAT.includes(ch)) {
        harakatCount++;
      }
    }

    if (harakatCount >= 2) {
      return true;
    }

    // Check for Alif-Lam (definite article)
    if (word.startsWith(SindhiUnicode.ARABIC_DEFINITE_ARTICLE)) {
      return true;
    }

    return false;
  }
}
