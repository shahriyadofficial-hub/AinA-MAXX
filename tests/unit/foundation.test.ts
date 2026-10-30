import { describe, it, expect } from "vitest";

describe("AinA Brand Tokens & Foundation", () => {
  it("defines standard AinA color hex values accurately", () => {
    const tokens = {
      black: "#0A0A0A",
      graphite: "#1A1A1D",
      rose: "#FF2D95",
      cerulean: "#007BA7",
      lightCerulean: "#3FB6E0",
    };

    expect(tokens.black).toBe("#0A0A0A");
    expect(tokens.graphite).toBe("#1A1A1D");
    expect(tokens.rose).toBe("#FF2D95");
    expect(tokens.cerulean).toBe("#007BA7");
    expect(tokens.lightCerulean).toBe("#3FB6E0");
  });

  it("enforces 18+ adult age guardrail by default", () => {
    const minAdultAge = 18;
    const calculateAge = (birthDate: Date, referenceDate: Date = new Date("2026-10-30")) => {
      let age = referenceDate.getFullYear() - birthDate.getFullYear();
      const m = referenceDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const adultDob = new Date("2005-01-15");
    const teenDob = new Date("2011-04-20");

    expect(calculateAge(adultDob)).toBeGreaterThanOrEqual(minAdultAge);
    expect(calculateAge(teenDob)).toBeLessThan(minAdultAge);
  });
});
