// lib/ai/cache.ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CACHE_DIR = path.resolve(process.cwd(), ".cache", "ai");

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function computeCacheKey(model: string, systemPrompt: string, userPrompt: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(`${model}:::${systemPrompt}:::${userPrompt}`);
  return hash.digest("hex");
}

export function getCachedAiResponse<T = unknown>(key: string): T | null {
  const isCacheEnabled =
    process.env.AI_CACHE_MODE === "true" ||
    process.env.NODE_ENV === "test";

  if (!isCacheEnabled) return null;

  try {
    ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.warn(`[AiCache] Read error for key ${key}:`, err);
  }
  return null;
}

export function setCachedAiResponse<T = unknown>(key: string, data: T): void {
  try {
    ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(`[AiCache] Write error for key ${key}:`, err);
  }
}
