// lib/auth/age-gate.ts

export type AgeGateStatus = "blocked" | "safe_mode" | "adult_full_access";

export interface AgeGateAssessment {
  age: number;
  status: AgeGateStatus;
  allowed: boolean;
  canUploadPhotos: boolean;
  canPersonalizeHealth: boolean;
  messageEn: string;
  messageBn: string;
}

export function evaluateAgeGate(
  birthDateInput: string | Date,
  referenceDate: Date = new Date("2026-10-30")
): AgeGateAssessment {
  const birthDate = typeof birthDateInput === "string" ? new Date(birthDateInput) : birthDateInput;
  if (isNaN(birthDate.getTime())) {
    throw new Error("Invalid birth date provided");
  }

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const m = referenceDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 13) {
    return {
      age,
      status: "blocked",
      allowed: false,
      canUploadPhotos: false,
      canPersonalizeHealth: false,
      messageEn: "Accounts under 13 are strictly prohibited under Bangladesh PDPA 2026 standards.",
      messageBn: "বাংলাদেশ পিডিপিএ ২০২৬ নির্দেশিকা অনুযায়ী ১৩ বছরের কম বয়সীদের অ্যাকাউন্ট তৈরি নিষিদ্ধ।",
    };
  }

  if (age >= 13 && age < 18) {
    return {
      age,
      status: "safe_mode",
      allowed: true,
      canUploadPhotos: false,
      canPersonalizeHealth: false,
      messageEn: "Ages 13–17 are granted read-only Safe Mode. Photo uploads and biometric personalization are locked.",
      messageBn: "১৩-১৭ বছর বয়সীদের জন্য সেফ মোড সক্রিয়। ছবি আপলোড বা ব্যক্তিগত বিশ্লেষণ লক থাকবে।",
    };
  }

  return {
    age,
    status: "adult_full_access",
    allowed: true,
    canUploadPhotos: true,
    canPersonalizeHealth: true,
    messageEn: "Adult 18+ verified. Full access to AI roadmaps, routine coaching, and Lookbook features.",
    messageBn: "১৮+ প্রাপ্তবয়স্ক যাচাই সম্পন্ন। এআই রোডম্যাপ, রুটিন এবং লুকবুক ব্যবহারে সম্পূর্ণ প্রবেশাধিকার সক্রিয়।",
  };
}
