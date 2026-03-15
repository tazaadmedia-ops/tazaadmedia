import { SindhiUnicode } from './SindhiUnicode';

export class Phase4PostProcessingFixes {
  // Common terms with confirmed Lam aspiration that bypass algorithmic rules
  private static readonly PATCH_TABLE: Record<string, string> = {
    // ڳالهه (Talk / Speech) variations
    'ڳالهه': 'ڳالھ',
    'ڳالهہ': 'ڳالھ', // Updated for new Phase 3 mapping
    'ڳالہ': 'ڳالھ',
    'ڳالهي': 'ڳالھي',
    'ڳالهيون': 'ڳالھيون',
    'ڳالهائيندي': 'ڳالھائيندي',
    'ڳالهائڻ': 'ڳالھائڻ',
    
    // ٻولهه (Conversation continuation) variations
    'ٻولهه': 'ٻولھ',
    'ٻولهہ': 'ٻولھ', // Updated
    'ٻولہ': 'ٻولھ',
    
    // سنڀالهه (Care) variations
    'سنڀالهه': 'سنڀالھ',
    'سنڀالهہ': 'سنڀالھ', // Updated
    'سنڀالہ': 'سنڀالھ',
    
    // ٿالهه (Platter) variations
    'ٿالهه': 'ٿالھ',
    'ٿالهہ': 'ٿالھ', // Updated
    'ٿالہ': 'ٿالھ',
  };

  public run(token: string): string {
    let corrected = token;

    // 1. Postposition ڪي → کي (Kaf + Yeh Arabic/Farsi -> Keheh + Yeh Arabic)
    if (corrected === '\u06AA\u064A' || corrected === '\u06AA\u06CC') {
      return SindhiUnicode.KAF_KEHEH + SindhiUnicode.YEH_ARABIC;
    }

    // 2. Standalone particle نھ → نہ
    if (corrected === '\u0646\u06BE' || corrected === 'نهہ' || corrected === 'نہ') {
      return 'نہ'; // Standardizing to single Mukhtafi per request
    }

    // 3. Patch Table application
    if (Phase4PostProcessingFixes.PATCH_TABLE[corrected]) {
      return Phase4PostProcessingFixes.PATCH_TABLE[corrected];
    }

    return corrected;
  }
}

