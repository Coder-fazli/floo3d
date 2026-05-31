/**
 * Auto-translate messages/en.json → messages/ar.json using Claude API
 * Usage: node scripts/translate.mjs
 * Requires: ANTHROPIC_API_KEY in .env.local
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// Read API key from .env.local
const envPath = path.join(root, ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const apiKeyMatch = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
if (!apiKeyMatch) {
  console.error("❌  ANTHROPIC_API_KEY not found in .env.local");
  process.exit(1);
}
const ANTHROPIC_API_KEY = apiKeyMatch[1].trim();

// Load source
const enPath = path.join(root, "messages", "en.json");
const arPath = path.join(root, "messages", "ar.json");
const enMessages = JSON.parse(fs.readFileSync(enPath, "utf-8"));
const arMessages = JSON.parse(fs.readFileSync(arPath, "utf-8"));

// Flatten nested JSON to { "nav.tools": "Tools", ... }
function flatten(obj, prefix = "") {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "object" && val !== null) {
      Object.assign(acc, flatten(val, fullKey));
    } else {
      acc[fullKey] = val;
    }
    return acc;
  }, {});
}

// Set nested value by dot-path
function setNested(obj, keyPath, value) {
  const keys = keyPath.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

// Get nested value
function getNested(obj, keyPath) {
  return keyPath.split(".").reduce((o, k) => o?.[k], obj);
}

// Find strings that need translation (empty or same as English = not translated)
const flatEn = flatten(enMessages);
const toTranslate = {};
for (const [key, enVal] of Object.entries(flatEn)) {
  const arVal = getNested(arMessages, key);
  if (!arVal || arVal === enVal) {
    toTranslate[key] = enVal;
  }
}

if (Object.keys(toTranslate).length === 0) {
  console.log("✅  All strings already translated.");
  process.exit(0);
}

console.log(`🔄  Translating ${Object.keys(toTranslate).length} strings to Arabic (Gulf/UAE dialect)...`);

// Call Claude API
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are translating a web app (MyHomeStyler — AI home design tool) UI strings from English to Arabic targeting Gulf/UAE users (Modern Standard Arabic with Gulf influence).

Rules:
- Keep brand names as-is: "MyHomeStyler", "Dashboard", "Pro Plan", "Free Plan"
- Keep technical UI labels short and clear
- Keep placeholders like {count} unchanged
- Return ONLY a valid JSON object mapping the same keys to Arabic translations
- No explanations, no markdown

English strings to translate:
${JSON.stringify(toTranslate, null, 2)}`,
      },
    ],
  }),
});

if (!response.ok) {
  const err = await response.text();
  console.error("❌  API error:", err);
  process.exit(1);
}

const data = await response.json();
const raw = data.content[0].text.trim();

// Parse JSON response (strip any accidental markdown fences)
let translated;
try {
  const clean = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  translated = JSON.parse(clean);
} catch (e) {
  console.error("❌  Failed to parse Claude response:\n", raw);
  process.exit(1);
}

// Merge translations into ar.json
const updatedAr = JSON.parse(JSON.stringify(arMessages));
for (const [key, arVal] of Object.entries(translated)) {
  setNested(updatedAr, key, arVal);
}

fs.writeFileSync(arPath, JSON.stringify(updatedAr, null, 2) + "\n");
console.log(`✅  Done! Updated messages/ar.json with ${Object.keys(translated).length} translations.`);
console.log(`📁  File: ${arPath}`);
