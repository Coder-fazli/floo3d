// Generates a beginner-friendly PDF guide on building a multilingual (i18n) system + SEO.
// Run: node scripts/make-i18n-guide.mjs   ->   ./i18n-seo-guide.pdf
import { jsPDF } from "jspdf";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "i18n-seo-guide.pdf");

// ---- palette ----
const ORANGE = [251, 59, 1];
const INK = [31, 41, 55];
const MUTE = [107, 114, 128];
const RULE = [226, 232, 240];
const CODEBG = [245, 246, 248];
const CALLBG = [255, 244, 238];

const doc = new jsPDF({ unit: "pt", format: "a4" });
const W = doc.internal.pageSize.getWidth();
const H = doc.internal.pageSize.getHeight();
const M = 54;
const CW = W - M * 2;
let y = M;

const setColor = (c) => doc.setTextColor(c[0], c[1], c[2]);
function ensure(h) { if (y + h > H - M) { doc.addPage(); y = M; } }

function wrap(text, size, font = "helvetica", style = "normal") {
  doc.setFont(font, style); doc.setFontSize(size);
  return doc.splitTextToSize(text, CW);
}

function para(text, { size = 10.5, gap = 6, color = INK, font = "helvetica", style = "normal", indent = 0 } = {}) {
  doc.setFont(font, style); doc.setFontSize(size); setColor(color);
  const lh = size * 1.42;
  const lines = doc.splitTextToSize(text, CW - indent);
  for (const ln of lines) { ensure(lh); doc.text(ln, M + indent, y); y += lh; }
  y += gap;
}

function h1(text) {
  ensure(46); y += 8;
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); setColor(INK);
  const lines = doc.splitTextToSize(text, CW);
  for (const ln of lines) { ensure(26); doc.text(ln, M, y); y += 25; }
  // accent underline
  doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2]); doc.setLineWidth(2.5);
  doc.line(M, y - 14, M + 46, y - 14);
  y += 12;
}

function h2(text) {
  ensure(34);
  doc.setFont("helvetica", "bold"); doc.setFontSize(13.5); setColor(ORANGE);
  const lines = doc.splitTextToSize(text, CW);
  for (const ln of lines) { ensure(20); doc.text(ln, M, y); y += 19; }
  y += 4;
}

function h3(text) {
  ensure(22);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); setColor(INK);
  doc.text(text, M, y); y += 16;
}

function bullet(text, { size = 10.5 } = {}) {
  doc.setFont("helvetica", "normal"); doc.setFontSize(size); setColor(INK);
  const lh = size * 1.4;
  const lines = doc.splitTextToSize(text, CW - 18);
  ensure(lh);
  doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2]); doc.setLineWidth(1.4);
  doc.line(M + 3, y - 3.2, M + 9, y - 3.2); // dash
  for (let i = 0; i < lines.length; i++) { ensure(lh); doc.text(lines[i], M + 18, y); y += lh; }
  y += 3;
}

function code(text) {
  doc.setFont("courier", "normal"); doc.setFontSize(8.7);
  const lines = String(text).split("\n").flatMap((l) => doc.splitTextToSize(l, CW - 24));
  const lh = 12.2;
  const boxH = lines.length * lh + 16;
  ensure(boxH + 6);
  doc.setFillColor(CODEBG[0], CODEBG[1], CODEBG[2]);
  doc.roundedRect(M, y - 2, CW, boxH, 5, 5, "F");
  doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2]); doc.setLineWidth(2);
  doc.line(M, y - 2, M, y - 2 + boxH);
  setColor([55, 65, 81]);
  let yy = y + 13;
  for (const ln of lines) { doc.text(ln, M + 14, yy); yy += lh; }
  y += boxH + 10;
}

function callout(title, text) {
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  const bodyLines = wrap(text, 9.8);
  const lh = 9.8 * 1.4;
  const boxH = 18 + bodyLines.length * lh + 12;
  ensure(boxH + 6);
  doc.setFillColor(CALLBG[0], CALLBG[1], CALLBG[2]);
  doc.roundedRect(M, y - 2, CW, boxH, 6, 6, "F");
  doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2]); doc.setLineWidth(2.5);
  doc.line(M, y - 2, M, y - 2 + boxH);
  setColor(ORANGE); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text(title, M + 14, y + 14);
  setColor(INK); doc.setFont("helvetica", "normal"); doc.setFontSize(9.8);
  let yy = y + 14 + lh;
  for (const ln of bodyLines) { doc.text(ln, M + 14, yy); yy += lh; }
  y += boxH + 10;
}

function rule() { ensure(14); doc.setDrawColor(RULE[0], RULE[1], RULE[2]); doc.setLineWidth(1); doc.line(M, y, M + CW, y); y += 14; }
function space(h = 6) { y += h; }

// ---------------- COVER ----------------
doc.setFillColor(255, 244, 238);
doc.rect(0, 0, W, H, "F");
doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
doc.rect(0, 0, W, 8, "F");
doc.setFont("helvetica", "bold"); doc.setFontSize(13); setColor(ORANGE);
doc.text("THE BEGINNER'S GUIDE", M, 150);
doc.setFontSize(34); setColor(INK);
doc.text(doc.splitTextToSize("Building a Multilingual Website the Right Way", CW), M, 195);
doc.setFont("helvetica", "normal"); doc.setFontSize(15); setColor(MUTE);
doc.text(doc.splitTextToSize("Internationalization (i18n) + International SEO, explained from zero.", CW - 40), M, 290);
doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2]); doc.setLineWidth(3); doc.line(M, 320, M + 70, 320);
doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); setColor(INK);
doc.text("What you will learn:", M, 380);
const coverPts = [
  "The one big idea that makes i18n simple",
  "The 3 things you actually translate",
  "How to choose your URL strategy (/es vs subdomain)",
  "The golden rule: one config drives everything",
  "International SEO: hreflang, canonical, sitemap, lang",
  "How adding a new language becomes a 2-step job",
];
let cy = 402;
for (const p of coverPts) {
  doc.setDrawColor(ORANGE[0], ORANGE[1], ORANGE[2]); doc.setLineWidth(1.5); doc.line(M + 2, cy - 3.2, M + 9, cy - 3.2);
  doc.text(p, M + 18, cy); cy += 20;
}
doc.setFontSize(9); setColor(MUTE);
doc.text("Prepared for MyHomeStyler  -  " + new Date().toISOString().slice(0, 10), M, H - 50);
doc.addPage(); y = M;

// ---------------- 1 ----------------
h1("1. Start Here: The One Big Idea");
para("If you remember only one sentence from this guide, make it this:");
callout("THE BIG IDEA", "Separate your CONTENT from your CODE. Your code should never contain sentences. Every piece of text lives in a separate translation file, looked up by a key.");
para("A beginner writes this (text baked into the code):");
code('<button>Sign Up</button>');
para("An i18n-ready app writes this (text looked up by a key):");
code('<button>{t("signUp")}</button>\n\n// messages/en.json -> { "signUp": "Sign Up" }\n// messages/es.json -> { "signUp": "Registrarse" }');
para("Now the SAME code renders in any language. To add a language you add a translation file - you never touch the components. That separation is the whole game.");

// ---------------- 2 ----------------
h1("2. The 3 Things You Actually Translate");
para("People think 'translation' is one job. It is really three, and beginners forget the last two.");
h3("1) UI strings");
para("Buttons, menus, labels, form placeholders. Short, reused everywhere. These go in per-language JSON files (en.json, es.json).");
h3("2) Content and SEO copy");
para("Page titles, meta descriptions, FAQs, blog posts, marketing text. This is what Google reads and ranks. It must be translated by a human, not just machine-translated.");
h3("3) The URLs themselves");
para("This is the one beginners miss. A Spanish page should live at its own address, e.g. /es/pricing, not the English URL. Search engines treat each language URL as its own page to index.");
callout("WHY URLs MATTER", "If English and Spanish share one URL, Google can only index one language. Real per-language URLs (/es/...) are what let you rank in Spanish search results.");

// ---------------- 3 ----------------
h1("3. Pick Your URL Strategy (decide this first)");
para("There are three ways to give each language its own URL. Pick ONE and stay consistent.");
h3("Option A - Subdirectory:  example.com/es/pricing   (recommended)");
bullet("Easiest to set up and maintain - one website, one domain.");
bullet("All your SEO authority stays on one domain.");
bullet("Default choice for most sites, including this one.");
h3("Option B - Subdomain:  es.example.com/pricing");
bullet("More separation, but Google may treat it as a partly separate site.");
bullet("More DNS and hosting setup.");
h3("Option C - Country domain:  example.es/pricing");
bullet("Strongest local signal, best if you target a specific country hard.");
bullet("Most expensive and complex - you buy and manage many domains.");
callout("RECOMMENDATION", "Start with Option A (subdirectory /es). It gives you 90% of the SEO benefit for 10% of the effort. Only move to B or C when you have a strong country-specific reason.");

// ---------------- 4 ----------------
h1("4. The Golden Rule: One Source of Truth");
para("This is the rule that decides whether adding language #4 takes 2 minutes or 2 days.");
callout("THE GOLDEN RULE", "Define your list of languages in ONE place. Every other part of the system - routing, the language switcher, the sitemap, SEO tags - should READ from that one list, never hardcode a language.");
para("Bad (a beginner trap): the language is checked by hand in dozens of files.");
code('// scattered in 15 different files...\nif (locale === "ar") { ... } else { ... }\nconst url = locale === "ar" ? "/ar" + path : path;');
para("Why it is bad: to add Spanish you must hunt down and edit every one of those lines. Miss one and that page silently breaks.");
para("Good: one config, and helpers that loop over it.");
code('// config.ts - the single source of truth\nexport const LOCALES = ["en", "es", "ar"];\nexport const DEFAULT = "en";\n\n// everything else is generated from LOCALES\nLOCALES.map(l => buildUrl(path, l));   // sitemap, hreflang, switcher...');
para("Now adding a language is adding ONE item to that array. Nothing else changes.");

// ---------------- 5 ----------------
h1("5. A Clean Folder Structure (Next.js example)");
para("This project uses Next.js with the next-intl library. A tidy i18n setup looks like this:");
code('/i18n\n   routing.ts      <- the LOCALES list (single source of truth)\n   request.ts      <- loads the right messages file\n/messages\n   en.json         <- English UI strings\n   es.json         <- Spanish UI strings (same keys!)\n   ar.json\n/app/[locale]/    <- pages that get a real /es/... URL\n   page.tsx        (home)\n   pricing/...\nmiddleware.ts     <- routes visitors to the right language\nsitemap.ts        <- generated from LOCALES\nrobots.ts');
para("The key idea: the [locale] folder name is a variable. One set of page files serves every language, and the URL prefix (/es) decides which translation loads.");

// ---------------- 6 ----------------
h1("6. Storing Translations the Right Way");
para("Keep one JSON file per language. Every file has the SAME keys, just different values. Group keys into namespaces so they stay organized.");
code('// en.json                      // es.json\n{                               {\n  "nav": {                        "nav": {\n    "pricing": "Pricing",           "pricing": "Precios",\n    "signUp": "Sign Up"             "signUp": "Registrarse"\n  }                               }\n}                               }');
bullet("Same keys in every file = a missing translation is easy to spot.");
bullet("One file per language = a translator can fill it in without touching code.");
bullet("Never put a full sentence in your components - only keys.");

// ---------------- 7 ----------------
h1("7. International SEO: The Checklist");
para("Translating the page is half the job. The other half is telling search engines about it. Miss these and your translated pages will not rank.");
h3("a) The html lang attribute");
para("Every page must declare its language so browsers and Google know.");
code('<html lang="es">            (and dir="rtl" for Arabic/Hebrew)');
h3("b) hreflang tags - the most important one");
para("On every page, list ALL its language versions, plus x-default (the fallback). This tells Google these pages are translations of each other, not duplicates.");
code('<link rel="alternate" hreflang="en"    href="https://site.com/pricing" />\n<link rel="alternate" hreflang="es"    href="https://site.com/es/pricing" />\n<link rel="alternate" hreflang="x-default" href="https://site.com/pricing" />');
h3("c) One canonical per page");
para("Each language URL points its canonical to itself - so /es/pricing is the canonical for the Spanish page, not the English one.");
h3("d) A localized sitemap");
para("Your sitemap should list every language URL and cross-link them with the same hreflang alternates. This is how Google discovers your /es pages.");
h3("e) robots rules");
para("Allow crawlers to reach your language paths (/es), and keep private areas (dashboard, admin) blocked under EVERY language prefix.");
h3("f) Translate the meta, not just the body");
para("The page <title> and meta description must be translated too - that is the text shown in Google results. A Spanish page with an English title looks broken to searchers.");
callout("DO NOT MACHINE-TRANSLATE SEO COPY", "Use human translation for titles, descriptions and important content. Google can detect low-quality auto-translation, and it reads unnaturally to real users - both hurt ranking and trust.");

// ---------------- 8 ----------------
h1("8. The Dream: Adding Language #4");
para("If your architecture is right, adding French should be this short:");
code('Step 1:  add "fr" to the LOCALES array.\nStep 2:  add messages/fr.json with the French text.\n\nThat is it. Routing, the switcher, the sitemap,\nhreflang and SEO tags all update automatically.');
callout("THE LITMUS TEST", "If adding a language forces you to edit many files and hunt for 'if locale == ...' checks, your locale logic is not centralized yet. That is the #1 thing to refactor before scaling to more languages.");

// ---------------- 9 ----------------
h1("9. Common Beginner Mistakes");
bullet("Hardcoding text in components instead of using translation keys.");
bullet("Scattering 'if (locale === x)' across many files instead of one config.");
bullet("Forgetting hreflang and canonical tags (pages get treated as duplicates).");
bullet("Machine-translating titles and descriptions (hurts ranking and trust).");
bullet("Translating the visible page but leaving the meta title/description in English.");
bullet("Forgetting to set the html lang (and dir for right-to-left languages).");
bullet("Not blocking private pages (dashboard, admin) under the new language prefix.");
bullet("Mixing URL strategies (some pages /es, some on a subdomain) with no plan.");

// ---------------- 10 ----------------
h1("10. Right-to-Left Languages (Arabic, Hebrew)");
para("These read right-to-left, so the whole layout must mirror. Two things handle most of it:");
bullet('Set dir="rtl" on the html element for those languages.');
bullet("Use logical CSS (margin-inline-start, not margin-left) so spacing flips automatically.");
para("Latin languages like Spanish, French and German are left-to-right, so they need no special layout work - only translation.");

// ---------------- 11 ----------------
h1("11. Recommended Stack and Quick Glossary");
h3("For a Next.js site");
bullet("next-intl or next-i18next for messages and routing.");
bullet("App Router with an [locale] folder for real per-language URLs.");
bullet("A single LOCALES config that drives routing, sitemap and hreflang.");
space(4);
h3("Glossary");
bullet("i18n - internationalization: building the app so it CAN support many languages.");
bullet("l10n - localization: actually translating and adapting for one language/region.");
bullet("locale - a language + region code, e.g. en-US, es-ES, ar-AE.");
bullet("hreflang - the tag that links a page to its other-language versions.");
bullet("canonical - the tag naming the one official URL for a page.");
bullet("slug - the readable part of a URL, e.g. /es/blog/mi-articulo.");

// ---------------- 12 cheat sheet ----------------
h1("12. One-Page Cheat Sheet");
h3("Setup order");
bullet("1. Pick a URL strategy (use /es subdirectory).");
bullet("2. Create ONE locales config - your single source of truth.");
bullet("3. Move all text into per-language JSON files (same keys).");
bullet("4. Build routing/sitemap/switcher that LOOP over the config.");
bullet("5. Add SEO: html lang, hreflang + x-default, canonical, sitemap, robots.");
bullet("6. Use human translation for titles, descriptions and content.");
space(4);
h3("Add a new language (the goal)");
bullet("Add the code to the LOCALES array.");
bullet("Add one JSON translation file.");
bullet("Done - everything else is generated.");
space(8);
rule();
para("Build it config-driven from day one, and your tenth language is as easy as your second.", { color: MUTE, style: "italic", size: 10 });

// footer page numbers
const total = doc.getNumberOfPages();
for (let i = 2; i <= total; i++) {
  doc.setPage(i);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); setColor(MUTE);
  doc.text("Multilingual + SEO - A Beginner's Guide", M, H - 24);
  doc.text(String(i - 1), W - M, H - 24, { align: "right" });
}

doc.save(OUT);
console.log("PDF written to", OUT);
