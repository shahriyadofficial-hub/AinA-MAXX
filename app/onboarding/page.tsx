"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Clock,
  Wallet,
  Compass,
} from "lucide-react";
import AinaLogo from "@/components/brand/AinaLogo";

interface OnboardingFormState {
  displayName: string;
  birthDate: string;
  locale: "en" | "bn";
  goals: string[];
  skinType: "oily" | "dry" | "combination" | "sensitive" | "normal";
  hairType: "straight" | "wavy" | "curly" | "coily" | "thinning";
  budgetTier: "budget" | "mid" | "premium";
  availableMinutes: number;
  photoProcessing: boolean;
  healthPersonalization: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState<OnboardingFormState>({
    displayName: "AinA Member",
    birthDate: "2002-05-15",
    locale: "en",
    goals: ["skin_barrier", "hair_volume"],
    skinType: "combination",
    hairType: "straight",
    budgetTier: "budget",
    availableMinutes: 15,
    photoProcessing: true,
    healthPersonalization: true,
  });

  const isBn = form.locale === "bn";

  // Calculate age on the fly
  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 0;
    const today = new Date("2026-10-30");
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(form.birthDate);
  const isUnder13 = currentAge < 13;
  const isTeen = currentAge >= 13 && currentAge < 18;
  const isAdult = currentAge >= 18;

  const toggleGoal = (goalKey: string) => {
    setForm((prev) => {
      const exists = prev.goals.includes(goalKey);
      if (exists) {
        if (prev.goals.length === 1) return prev; // Keep at least one
        return { ...prev, goals: prev.goals.filter((g) => g !== goalKey) };
      }
      if (prev.goals.length >= 5) return prev;
      return { ...prev, goals: [...prev.goals, goalKey] };
    });
  };

  const handleFinish = async () => {
    if (isUnder13) {
      setErrorMessage(
        isBn
          ? "১৩ বছরের কম বয়সী অ্যাকাউন্ট পিডিপিএ ২০২৬ অনুযায়ী তৈরি করা যাবে না।"
          : "Under-13 account registration is strictly blocked under PDPA 2026 standards."
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          birthDate: form.birthDate,
          locale: form.locale,
          goals: form.goals,
          skinType: form.skinType,
          hairType: form.hairType,
          budgetTier: form.budgetTier,
          availableMinutes: form.availableMinutes,
          consents: {
            photoProcessing: isAdult ? form.photoProcessing : false,
            healthPersonalization: isAdult ? form.healthPersonalization : false,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to complete onboarding");
      }

      // Success: Route to Roadmap
      router.push("/roadmap");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving onboarding";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-2">
      {/* Top Header & Step Indicator */}
      <div className="flex items-center justify-between">
        <AinaLogo size="sm" showSubtitle={false} />
        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <button
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                locale: prev.locale === "en" ? "bn" : "en",
              }))
            }
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 hover:text-white"
          >
            <Globe className="w-3.5 h-3.5 text-aina-light-cerulean" />
            <span className="font-semibold">{isBn ? "English" : "বাংলা"}</span>
          </button>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-aina-graphite text-neutral-400 border border-white/5 font-display">
            {step} / 5
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-aina-rose to-aina-light-cerulean transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Transformation Goals */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold font-display text-white">
              {isBn ? "তোমার প্রধান লক্ষ্যসমূহ কি?" : "What are your primary goals?"}
            </h1>
            <p className="text-xs text-neutral-400">
              {isBn
                ? "সর্বোচ্চ ৫টি নির্বাচন করতে পারো (কমপক্ষে ১টি)।"
                : "Select the areas you want your 30-day plan to focus on."}
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: "skin_barrier",
                title: isBn ? "ত্বকের সুস্থতা ও ব্যারিয়ার মেরামত" : "Skin Barrier & Hydration",
                desc: isBn ? "ব্রণ ও শুষ্কতা নিয়ন্ত্রণ" : "Acne defense & moisture lock",
              },
              {
                id: "hair_volume",
                title: isBn ? "চুলের ঘনত্ব ও খুশকি নিরাময়" : "Hair Volume & Scalp Density",
                desc: isBn ? "ক্লিন স্ক্যাল্প ও শিকড়ের যত্ন" : "Frizz control & mineral buildup removal",
              },
              {
                id: "daily_drip",
                title: isBn ? "দৈনিক আউটফিট ও ড্রিপ স্টাইল" : "AinA Drip & Capsule Wardrobe",
                desc: isBn ? "৩ডি লুকবুক ও স্মার্ট কম্বিনেশন" : "Occasion matching & 3D styling",
              },
              {
                id: "fitness_mobility",
                title: isBn ? "শারীরিক ফিটনেস ও নমনীয়তা" : "Daily Mobility & Posture",
                desc: isBn ? "১৫ মিনিটের দৈনিক রুটিন" : "Short daily routine for energy",
              },
              {
                id: "nutrition_energy",
                title: isBn ? "খাদ্যাভ্যাস ও হাইড্রেটিং হ্যাবিট" : "Hydration & Energy Habits",
                desc: isBn ? "দৈনিক ২.৫ লিটার পানি ও ঘুম" : "Consistent sleep & water tracking",
              },
            ].map((goal) => {
              const selected = form.goals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  type="button"
                  className={`w-full p-3.5 rounded-aina-sm border text-left transition-all flex items-center justify-between ${
                    selected
                      ? "bg-aina-rose/10 border-aina-rose shadow-glow-rose/20 text-white"
                      : "bg-aina-graphite/40 border-white/5 text-neutral-300 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold">{goal.title}</p>
                    <p className="text-[11px] text-neutral-400">{goal.desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      selected
                        ? "bg-aina-rose border-aina-rose text-white"
                        : "border-neutral-600"
                    }`}
                  >
                    {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Skin & Hair Type */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-lg font-bold font-display text-white">
              {isBn ? "ত্বক ও চুলের ধরন নির্বাচন করো" : "Your Skin & Hair Profile"}
            </h1>
            <p className="text-xs text-neutral-400">
              {isBn
                ? "বাংলাদেশি আবহাওয়া ও আর্দ্রতা বিবেচনায় সঠিক পরামর্শের জন্য।"
                : "Calibrates routines for Dhaka heat, tap water, and humidity."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 font-display">
              {isBn ? "ত্বকের ধরন" : "Skin Type"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "oily", label: isBn ? "তৈলাক্ত (Oily)" : "Oily" },
                { id: "dry", label: isBn ? "শুষ্ক (Dry)" : "Dry" },
                { id: "combination", label: isBn ? "মিশ্র (Combination)" : "Combination" },
                { id: "sensitive", label: isBn ? "সংবেদনশীল (Sensitive)" : "Sensitive" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      skinType: t.id as OnboardingFormState["skinType"],
                    }))
                  }
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    form.skinType === t.id
                      ? "bg-aina-cerulean/20 border-aina-light-cerulean text-white"
                      : "bg-aina-graphite/40 border-white/5 text-neutral-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 font-display">
              {isBn ? "চুলের গঠন" : "Hair Texture"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "straight", label: isBn ? "সোজা (Straight)" : "Straight" },
                { id: "wavy", label: isBn ? "ঢেউখেলানো (Wavy)" : "Wavy" },
                { id: "curly", label: isBn ? "কোঁকড়া (Curly)" : "Curly" },
                { id: "thinning", label: isBn ? "পাতলা (Thinning)" : "Thinning / Fine" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      hairType: t.id as OnboardingFormState["hairType"],
                    }))
                  }
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    form.hairType === t.id
                      ? "bg-aina-rose/20 border-aina-rose text-white"
                      : "bg-aina-graphite/40 border-white/5 text-neutral-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Monthly BDT Budget Tier */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold font-display text-white">
              {isBn ? "মাসিক বাজেট নির্ধারণ করো" : "Monthly BDT Budget Tier"}
            </h1>
            <p className="text-xs text-neutral-400">
              {isBn
                ? "আমরা অপ্রয়োজনীয় দামি প্রসাধন সুপারিশ করব না।"
                : "AinA prioritizes affordable, locally accessible Bangladeshi products."}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "budget",
                tier: isBn ? "বাজেট টিয়ার (Budget)" : "Essential / Student Tier",
                range: "৳500 – ৳1,500 BDT / month",
                desc: isBn
                  ? "স্থানীয় ও কার্যকর পণ্য (Simple, Parachute, Lafz)"
                  : "Gentle local & pharmacy staples (Simple Wash, Coconut Oil, Aloe)",
              },
              {
                id: "mid",
                tier: isBn ? "মিড টিয়ার (Mid-Tier)" : "Balanced / K-Beauty Tier",
                range: "৳1,500 – ৳4,000 BDT / month",
                desc: isBn
                  ? "কোরিয়ান সানস্ক্রিন ও এক্টিভ সিরাম (COSRX, The Ordinary)"
                  : "Targeted actives & certified Korean SPF (Snail Mucin, Niacinamide)",
              },
              {
                id: "premium",
                tier: isBn ? "প্রিমিয়াম টিয়ার (Premium)" : "Advanced Clinical Tier",
                range: "৳4,000+ BDT / month",
                desc: isBn
                  ? "ডার্মাটোলজিস্ট গ্রেড ও স্পেশাল কেয়ার"
                  : "Dermatologist-grade specialized barrier solutions & treatments",
              },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    budgetTier: b.id as OnboardingFormState["budgetTier"],
                  }))
                }
                className={`w-full p-4 rounded-aina-sm border text-left transition-all flex items-start justify-between ${
                  form.budgetTier === b.id
                    ? "bg-purple-950/20 border-purple-500 shadow-lg text-white"
                    : "bg-aina-graphite/40 border-white/5 text-neutral-300 hover:border-white/20"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-purple-400" />
                    <p className="text-xs font-bold font-display">{b.tier}</p>
                  </div>
                  <p className="text-xs font-semibold text-neutral-200">{b.range}</p>
                  <p className="text-[11px] text-neutral-400">{b.desc}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border mt-1 ${
                    form.budgetTier === b.id
                      ? "bg-purple-500 border-purple-500 text-white"
                      : "border-neutral-600"
                  }`}
                >
                  {form.budgetTier === b.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Daily Commitment Minutes */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold font-display text-white">
              {isBn ? "দৈনিক কতটুকু সময় দিতে পারবে?" : "Daily Available Minutes"}
            </h1>
            <p className="text-xs text-neutral-400">
              {isBn
                ? "তোমার ব্যস্ততা অনুযায়ী রুটিনের দৈর্ঘ্য ঠিক হবে।"
                : "Consistency over perfection. We design tasks that fit your real schedule."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { mins: 5, label: "5 Mins / day", sub: "Quick Habit Minimal" },
              { mins: 15, label: "15 Mins / day", sub: "Recommended Standard" },
              { mins: 30, label: "30 Mins / day", sub: "Full Transformation" },
              { mins: 45, label: "45 Mins / day", sub: "Deep Care & Workout" },
            ].map((m) => (
              <button
                key={m.mins}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, availableMinutes: m.mins }))}
                className={`p-4 rounded-aina-sm border text-left flex flex-col justify-between h-28 transition-all ${
                  form.availableMinutes === m.mins
                    ? "bg-aina-cerulean/20 border-aina-light-cerulean text-white"
                    : "bg-aina-graphite/40 border-white/5 text-neutral-300"
                }`}
              >
                <Clock className="w-5 h-5 text-aina-light-cerulean" />
                <div>
                  <p className="text-sm font-bold font-display">{m.label}</p>
                  <p className="text-[10px] text-neutral-400">{m.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: DOB Age Gate & PDPA 2026 Consent Registry */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold font-display text-white">
              {isBn ? "বয়স যাচাই ও গোপনীয়তা সম্মতি" : "Age Gate & Privacy Consents"}
            </h1>
            <p className="text-xs text-neutral-400">
              {isBn
                ? "বাংলাদেশ পিডিপিএ ২০২৬ সম্মতি এবং নিরাপত্তা নিশ্চিতে।"
                : "Compliance with Bangladesh Personal Data Protection Act 2026."}
            </p>
          </div>

          {/* DOB Input */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-aina-graphite/50 border border-white/5">
            <label className="text-xs font-semibold text-neutral-300 font-display">
              {isBn ? "জন্ম তারিখ (Date of Birth)" : "Date of Birth"}
            </label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-aina-dark border border-neutral-700 text-white text-xs focus:outline-none focus:border-aina-rose"
            />

            {/* Age Triage Badges */}
            <div className="pt-2">
              {isUnder13 && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-[11px]">
                    {isBn
                      ? "বয়স ১৩ এর কম। একাউন্ট তৈরি সাময়িকভাবে বন্ধ।"
                      : "Age < 13: Account creation blocked under PDPA 2026 youth protection rules."}
                  </span>
                </div>
              )}

              {isTeen && (
                <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px]">
                    {isBn
                      ? "বয়স ১৩-১৭: সেফ মোড সক্রিয়। কোনো বায়োমেট্রিক ছবি বিশ্লেষণ করা হবে না।"
                      : "Age 13–17: Read-only safe mode. No photo upload or biometric analysis permitted."}
                  </span>
                </div>
              )}

              {isAdult && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">
                    {isBn
                      ? "বয়স ১৮+ যাচাই সম্পন্ন। সম্পূর্ণ এআই অ্যাক্সেস সক্রিয়।"
                      : "Age 18+ verified: Full access to AI roadmaps, Lookbook, and coach."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Revocable Purpose-Specific Consents */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-display">
              {isBn ? "সম্মতি সেটিংস (যেকোনো সময় পরিবর্তনযোগ্য)" : "Consent Registry (Revocable Anytime)"}
            </p>

            <div className="p-3 rounded-xl bg-aina-dark/90 border border-white/5 flex items-start space-x-3">
              <input
                type="checkbox"
                checked={true}
                disabled={true}
                className="mt-0.5 w-4 h-4 rounded text-aina-rose"
              />
              <div className="text-[11px] text-neutral-300">
                <span className="font-bold text-white block">
                  {isBn ? "প্রয়োজনীয় অ্যাকাউন্ট ডেটা" : "Essential Account Functionality"}
                </span>
                {isBn
                  ? "রোডম্যাপ তৈরি ও প্রগ্রেস সংরক্ষণের জন্য অপরিহার্য।"
                  : "Required to save routines, progress, and streak XP."}
              </div>
            </div>

            <label className="p-3 rounded-xl bg-aina-dark/90 border border-white/5 flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.photoProcessing && isAdult}
                disabled={!isAdult}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, photoProcessing: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded text-aina-rose"
              />
              <div className="text-[11px] text-neutral-300">
                <span className="font-bold text-white block">
                  {isBn ? "প্রাইভেট ছবি বিশ্লেষণ (ঐচ্ছিক)" : "Private Photo Vision Guidance (Optional)"}
                </span>
                {isBn
                  ? "ব্যারিয়ার ও হেয়ারকাট গাইডের জন্য। কোনো ছবি পাবলিক হবে না।"
                  : "Used strictly for barrier & haircut vision guidance. Never public."}
              </div>
            </label>

            <label className="p-3 rounded-xl bg-aina-dark/90 border border-white/5 flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.healthPersonalization && isAdult}
                disabled={!isAdult}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, healthPersonalization: e.target.checked }))
                }
                className="mt-0.5 w-4 h-4 rounded text-aina-rose"
              />
              <div className="text-[11px] text-neutral-300">
                <span className="font-bold text-white block">
                  {isBn ? "হাইড্রেটিং ও স্কিন পার্সোনালাইজেশন" : "Hydration & Routine Personalization"}
                </span>
                {isBn
                  ? "আবহাওয়া অনুযায়ী সক্রিয় উপাদান দ্বন্দ্ব পরীক্ষা করতে।"
                  : "Allow AI to warn about ingredient conflicts in Bangladesh humidity."}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-aina-graphite border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBn ? "পিছনে" : "Back"}</span>
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-aina-rose text-white text-xs font-semibold shadow-glow-rose hover:bg-aina-rose/90 transition-transform active:scale-95"
          >
            <span>{isBn ? "পরবর্তী" : "Next Step"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={submitting || isUnder13}
            className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-glow-rose ${
              isUnder13
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                : "bg-aina-rose text-white hover:bg-aina-rose/90 active:scale-95"
            }`}
          >
            <span>{submitting ? (isBn ? "সংরক্ষণ হচ্ছে..." : "Activating Plan...") : isBn ? "প্ল্যান চালু করো" : "Activate 30-Day Plan"}</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
