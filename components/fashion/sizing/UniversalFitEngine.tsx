"use client";

// components/fashion/sizing/UniversalFitEngine.tsx
// AinA Universal Fit (Bangladesh Edition) — headless engine hook.
//
// Wraps the deterministic evaluator (lib/engine/bangladeshSizing.ts) with
// the PDPA-2026 persistence lifecycle:
//   - Guests: everything stays in React state. Zero network, zero storage
//     unless the user explicitly taps "save on this device".
//   - On-device save: AES-GCM encrypted localStorage (`ainafit_profile`)
//     via WebCrypto with a device-local key.
//   - Account save: ONLY behind the explicit consent toggle, via
//     /api/v1/size/profile. One-tap erasure wipes device + account copies.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  eraseFitProfileLocal,
  loadFitProfileLocal,
  recommendAcrossBrands,
  saveFitProfileLocal,
  type BrandSizeVerdict,
  type GarmentCategory,
  type LocalFitType,
  type UserBodyProfileInput,
} from "@/lib/engine/bangladeshSizing";

export const DEFAULT_FIT_PROFILE: UserBodyProfileInput = {
  heightInches: 67, // 5'7" — common Dhaka tailor default
  weightKg: 68,
  chestInches: 40, // বুকের মাপ
  waistInches: 33,
  fitPreference: "SEMI_FIT",
  bodyComposition: "REGULAR",
};

export interface UniversalFitEngineState {
  profile: UserBodyProfileInput;
  setProfile: (patch: Partial<UserBodyProfileInput>) => void;
  /** Cross-brand verdicts for the active garment type (live, deterministic). */
  verdictsFor: (garmentType: GarmentCategory) => BrandSizeVerdict[];
  /** True once a saved on-device profile was restored. */
  restoredFromDevice: boolean;
  saveToDevice: () => Promise<void>;
  saveToAccount: () => Promise<{ ok: boolean; message: string }>;
  eraseEverywhere: () => Promise<void>;
  consentGranted: boolean;
  setConsentGranted: (value: boolean) => void;
}

export function useUniversalFitEngine(
  initial: UserBodyProfileInput = DEFAULT_FIT_PROFILE
): UniversalFitEngineState {
  const [profile, setProfileState] = useState<UserBodyProfileInput>(initial);
  const [restoredFromDevice, setRestoredFromDevice] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);

  // Restore the encrypted on-device profile (if the user saved one before).
  useEffect(() => {
    let cancelled = false;
    loadFitProfileLocal()
      .then((stored) => {
        if (!cancelled && stored) {
          const { savedAt: _savedAt, consentGranted: storedConsent, ...rest } = stored;
          void _savedAt;
          setProfileState(rest);
          setConsentGranted(Boolean(storedConsent));
          setRestoredFromDevice(true);
        }
      })
      .catch(() => {
        /* corrupt/absent storage → tailor defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setProfile = useCallback((patch: Partial<UserBodyProfileInput>) => {
    setProfileState((prev) => ({ ...prev, ...patch }));
  }, []);

  const verdictsFor = useCallback(
    (garmentType: GarmentCategory) => recommendAcrossBrands(profile, garmentType),
    [profile]
  );

  const saveToDevice = useCallback(async () => {
    await saveFitProfileLocal({
      ...profile,
      savedAt: new Date().toISOString(),
      consentGranted,
    });
    setRestoredFromDevice(true);
  }, [profile, consentGranted]);

  const saveToAccount = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const res = await fetch("/api/v1/size/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, consentGranted }),
      });
      if (res.status === 403) {
        return {
          ok: false,
          message: "Consent required — আপনার সম্মতি ছাড়া কোনো মাপ সার্ভারে সংরক্ষণ করা হবে না।",
        };
      }
      if (!res.ok) return { ok: false, message: "Could not save to your account. Your on-device copy is untouched." };
      return { ok: true, message: "Profile saved to your AinA account (PDPA 2026 consent recorded)." };
    } catch {
      return { ok: false, message: "Offline — profile kept on this device only." };
    }
  }, [profile, consentGranted]);

  const eraseEverywhere = useCallback(async () => {
    // Local wipe is synchronous and immediate — never block the user's
    // erasure feedback on the network. Account erasure is fire-and-forget.
    eraseFitProfileLocal();
    setRestoredFromDevice(false);
    try {
      await fetch("/api/v1/size/profile", { method: "DELETE" });
    } catch {
      /* offline erasure still wipes the device copy */
    }
  }, []);

  return useMemo(
    () => ({
      profile,
      setProfile,
      verdictsFor,
      restoredFromDevice,
      saveToDevice,
      saveToAccount,
      eraseEverywhere,
      consentGranted,
      setConsentGranted,
    }),
    [profile, setProfile, verdictsFor, restoredFromDevice, saveToDevice, saveToAccount, eraseEverywhere, consentGranted]
  );
}

/** Fit preference options, bilingual (Tailor Mode vocabulary). */
export const FIT_OPTIONS: { value: LocalFitType; en: string; bn: string }[] = [
  { value: "SLIM_FIT", en: "Slim", bn: "স্লিম" },
  { value: "SEMI_FIT", en: "Semi-Fit", bn: "সেমি-ফিট" },
  { value: "REGULAR", en: "Regular", bn: "রেগুলার" },
  { value: "RELAXED_OVERSIZED", en: "Relaxed", bn: "লুজ/রিল্যাক্সড" },
];
