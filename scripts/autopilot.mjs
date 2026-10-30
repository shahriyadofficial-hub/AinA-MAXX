#!/usr/bin/env node
/**
 * scripts/autopilot.mjs
 * Watchdog script for AinA (Ai∩A MAXX) Autonomous Queue Execution & Meta Model API Health.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const queueFile = path.join(rootDir, 'PROMPT_QUEUE.md');
const envLocalFile = path.join(rootDir, '.env.local');

// Parse environment variables manually from .env.local if not already in process.env
if (fs.existsSync(envLocalFile)) {
  const content = fs.readFileSync(envLocalFile, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

function parseQueue() {
  if (!fs.existsSync(queueFile)) {
    console.error(`[-] PROMPT_QUEUE.md not found at ${queueFile}`);
    return { total: 0, completed: 0, inProgress: 0, pending: 0, items: [] };
  }
  const content = fs.readFileSync(queueFile, 'utf8');
  const lines = content.split('\n');
  const items = [];
  let currentItem = null;

  for (const line of lines) {
    const promptMatch = line.match(/^- \[(x| |~)\] \*\*PROMPT (\d+) — (.*?)\*\*/);
    if (promptMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        status: promptMatch[1],
        num: parseInt(promptMatch[2], 10),
        title: promptMatch[3],
        description: ''
      };
    } else if (currentItem && line.trim().length > 0) {
      currentItem.description += (currentItem.description ? ' ' : '') + line.trim();
    }
  }
  if (currentItem) items.push(currentItem);

  const completed = items.filter(i => i.status === 'x').length;
  const inProgress = items.filter(i => i.status === '~').length;
  const pending = items.filter(i => i.status === ' ').length;

  return { total: items.length, completed, inProgress, pending, items };
}

async function testMetaApiConnectivity() {
  const apiKey = process.env.MODEL_API_KEY;
  const baseUrl = process.env.META_MODEL_API_BASE_URL || 'https://api.meta.ai/v1';

  console.log(`\n🔍 Checking Meta Model API Connectivity:`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Model Key configured: ${apiKey ? 'YES (Protected)' : 'NO'}`);

  if (!apiKey) {
    console.warn(`⚠️ Warning: MODEL_API_KEY is not set in process.env or .env.local.`);
    return { ok: false, status: 0, message: 'Missing MODEL_API_KEY' };
  }

  try {
    const res = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
    const rateLimitReset = res.headers.get('x-ratelimit-reset');
    const retryAfter = res.headers.get('retry-after');

    if (res.status === 429) {
      console.warn(`🛑 Meta API returned 429 Too Many Requests (Rate limit hit)`);
      const waitSec = parseInt(retryAfter || rateLimitReset || '60', 10);
      console.log(`⏳ Auto-sleep trigger: will wait ${waitSec}s for quota window to reset...`);
      return { ok: false, status: 429, waitSeconds: waitSec };
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`⚠️ Meta API responded with status ${res.status}: ${errText.slice(0, 150)}`);
      return { ok: false, status: res.status, message: errText };
    }

    console.log(`✅ Meta Model API is online & responding (Status ${res.status})`);
    if (rateLimitRemaining) console.log(`   Rate Limit Remaining: ${rateLimitRemaining}`);
    return { ok: true, status: res.status };
  } catch (err) {
    console.warn(`⚠️ Could not reach Meta Model API (${err.message}). Local offline/cached mode will be used.`);
    return { ok: false, status: -1, message: err.message };
  }
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`  🚀 AinA (Ai∩A MAXX) — AUTONOMOUS WATCHDOG`);
  console.log(`  Meta Global AI Developer Hackathon ($1M Prize Track)`);
  console.log(`======================================================\n`);

  const queue = parseQueue();
  console.log(`📊 Progress: ${queue.completed}/${queue.total} phases complete (${Math.round((queue.completed / (queue.total || 1)) * 100)}%)`);
  console.log(`   [x] Completed:   ${queue.completed}`);
  console.log(`   [~] In Progress: ${queue.inProgress}`);
  console.log(`   [ ] Pending:     ${queue.pending}\n`);

  for (const item of queue.items) {
    const icon = item.status === 'x' ? '✅' : item.status === '~' ? '🔄' : '⏳';
    console.log(`   ${icon} PROMPT ${String(item.num).padStart(2, '0')}: ${item.title}`);
  }

  const apiStatus = await testMetaApiConnectivity();

  if (apiStatus.status === 429 && apiStatus.waitSeconds > 0) {
    console.log(`\n💤 Entering automatic sleep loop for ${apiStatus.waitSeconds} seconds...`);
    let remaining = apiStatus.waitSeconds;
    while (remaining > 0) {
      process.stdout.write(`\r   Resuming in ${remaining}s... `);
      await new Promise(r => setTimeout(r, 1000));
      remaining--;
    }
    console.log(`\n🔄 Quota timer expired. Rechecking connectivity...`);
    await testMetaApiConnectivity();
  }

  console.log(`\n🎯 Next actionable task:`);
  const nextItem = queue.items.find(i => i.status === ' ' || i.status === '~');
  if (nextItem) {
    console.log(`   👉 PROMPT ${String(nextItem.num).padStart(2, '0')} — ${nextItem.title}`);
  } else {
    console.log(`   🎉 ALL PHASES COMPLETED! Production ready!`);
  }
  console.log(`\n======================================================\n`);
}

main().catch(err => {
  console.error("Autopilot error:", err);
  process.exit(1);
});
