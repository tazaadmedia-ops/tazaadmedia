/**
 * All Unicode codepoints relevant to Sindhi-Arabic script normalization.
 * Ported from Hesudhar PHP/Python Implementation.
 */
export const SindhiUnicode = {
  // -- HEH FAMILY ------------------------------------------------------------
  HEH_ARABIC: "\u0647",   // ه — ملفوظي — Malfoozi (pronounced /h/)
  HEH_DOACHASHMEE: "\u06BE",   // ھ — وسرڳي — Visargi (aspiration marker)
  HEH_GOAL: "\u06C1",   // ہ — مختفي — Mukhtafi (word-final weak)
  HEH_GOAL_HAMZA: "\u06C2",   // ۂ — variant (normalize to HEH_GOAL)
  HEH_AE: "\u06D5",   // ە — alternative Mukhtafi encoding
  HEH_YEH: "\u06C0",   // ۀ — normalize to HEH_GOAL

  HEH_VARIANTS: [
    "\u0647",
    "\u06BE",
    "\u06C1",
    "\u06C2",
    "\u06D5",
    "\u06C0"
  ] as string[],

  // -- KAF FAMILY ------------------------------------------------------------
  KAF_ARABIC: "\u0643",   // ك — Arabic (NOT Sindhi native)
  KAF_SINDHI_SWASH: "\u06AA",   // ڪ — unaspirated /k/ (native Sindhi)
  KAF_KEHEH: "\u06A9",   // ک — aspirated /kh/ (also خ context)
  KAF_VARIANTS: [
    "\u0643",
    "\u06AA",
    "\u06A9"
  ] as string[],

  // -- YEH FAMILY ------------------------------------------------------------
  YEH_ARABIC: "\u064A",   // ي — Sindhi standard (dotted)
  YEH_FARSI: "\u06CC",   // ی — Persian/Urdu (dotless)
  YEH_ARABIC_MAX: "\u0649",   // ى — Alef Maqsura
  YEH_VARIANTS: [
    "\u064A",
    "\u06CC",
    "\u0649"
  ] as string[],

  // -- ALEF FAMILY -----------------------------------------------------------
  ALEF_MADDA: "\u0622",   // آ — atomic preferred
  ALEF_HAMZA_ABOVE: "\u0623",   // أ
  ALEF_HAMZA_BELOW: "\u0625",   // إ
  ALEF_PLAIN: "\u0627",   // ا
  ALEF_MADDA_SEQ: "\u0627\u0653",  // ا + Madda → آ

  // -- IMPLOSIVE CONSONANTS ----------------------------------------------
  IMPLOSIVES: [
    "\u067B",        // ٻ — implosive B
    "\u0684",        // ڄ — implosive J
    "\u068F",        // ڏ — implosive D
    "\u06B3",        // ڳ — implosive G
  ] as string[],

  // -- ASPIRATION-TRIGGERING CONSONANTS --------------------------------------
  ASPIRATION_TRIGGERS: [
    "\u0646",   // ن — N
    "\u0645",   // م — M
    "\u0644",   // ل — L
    "\u06AF",   // گ — G
    "\u0DA9",   // ڙ — RR (retroflex R)
    "\u0631",   // ر — R
    "\u06BB",   // ڻ — NN (retroflex N)
  ] as string[],

  // -- VOWEL DIACRITICS ------------------------------------------------------
  VOWEL_DIACRITICS: [
    "\u064E",   // ◌َ — Fatha (zabar)
    "\u064F",   // ◌ُ — Damma (pesh)
    "\u0650",   // ◌ِ — Kasra (zer)
    "\u064B",   // ◌ً — Tanwin Fath
    "\u064C",   // ◌ٌ — Tanwin Damm
    "\u064D",   // ◌ٍ — Tanwin Kasr
    "\u0652",   // ◌ْ — Sukun
    "\u0651",   // ◌ّ — Shadda
    "\u0670",   // ◌ٰ — Superscript Alef
  ] as string[],

  ARABIC_DEFINITE_ARTICLE: "\u0627\u0644",   // ال
} as const;
