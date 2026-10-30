// lib/ai/safety.ts
/**
 * Deterministic Safety Filter for AinA (Ai∩A MAXX)
 * Guarantees zero attractiveness scoring, zero facial ranking, and clinical escalation.
 */

const FORBIDDEN_ATTRACTIVENESS_PATTERNS = [
  /\b(\d{1,2}\s*\/\s*10|\d{1,2}\s*out of\s*10)\b/gi,
  /\b(scale of 1 to 10|scale of 1-10)\b/gi,
  /\b(rate\s*(my\s*)?attractiveness|rate\s*(my\s*)?face|rate\s*(my\s*)?looks|rate\s*me)\b/gi,
  /\b(attractiveness\s*score|beauty\s*score|face\s*rating|looksmax|looksmaxxing|attractiveness)\b/gi,
  /\b(ugly|hideous|subhuman|chad|sub-tier|glow-up\s*percentage)\b/gi,
  /\b(\d{1,3}%\s*attractive|\d{1,3}%\s*glow-up)\b/gi,
];

const MEDICAL_DIAGNOSIS_PATTERNS = [
  /\b(i\s*diagnose\s*you\s*with|you\s*definitely\s*have|clinical\s*prescription)\b/gi,
  /\b(accutane|isotretinoin|spironolactone|minoxidil\s*oral)\b/gi,
];

export interface SafetyCheckResult {
  passed: boolean;
  flags: string[];
  sanitizedText: string;
}

export function runSafetyScreen(text: string): SafetyCheckResult {
  const flags: string[] = [];
  let sanitized = text;

  // 1. Attractiveness Scoring & Face Ranking Filter
  for (const pattern of FORBIDDEN_ATTRACTIVENESS_PATTERNS) {
    // Reset regex lastIndex if global
    pattern.lastIndex = 0;
    if (pattern.test(sanitized)) {
      flags.push("AI-SAFE-01: Attractiveness rating or looksmaxxing terminology detected");
      pattern.lastIndex = 0;
      sanitized = sanitized.replace(pattern, "[Guidance focused on skin barrier health]");
    }
  }

  // 2. Clinical Diagnosis & Prescription Filter
  for (const pattern of MEDICAL_DIAGNOSIS_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(sanitized)) {
      flags.push("AI-SAFE-02: Prescription/clinical medication recommendation detected");
      pattern.lastIndex = 0;
      sanitized = sanitized.replace(
        pattern,
        "[Consult a certified Bangladesh dermatologist for clinical treatment]"
      );
    }
  }

  return {
    passed: flags.length === 0,
    flags,
    sanitizedText: sanitized,
  };
}

export function assertSafePrompt(prompt: string): void {
  const check = runSafetyScreen(prompt);
  if (!check.passed && check.flags.some(f => f.includes("AI-SAFE-01"))) {
    throw new Error(
      "Safety Policy Violation: Attractiveness ratings and face scoring are strictly prohibited in AinA."
    );
  }
}
