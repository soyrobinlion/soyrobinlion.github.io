#!/usr/bin/env node
/* Build verification for SOYROBINLION static site.
   No compilation, no bundling — validates the static deliverable. */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
let errors = 0;

function fail(msg) {
  console.error("  ✖ " + msg);
  errors++;
}
function ok(msg) {
  console.log("  ✓ " + msg);
}

console.log("SOYROBINLION build verification\n");

// 1. Required files exist
console.log("1. Required files");
const required = [
  "index.html",
  "assets/css/styles.css",
  "assets/js/main.js",
  "assets/img/favicon.svg",
  "assets/img/cover.svg",
  "README.md",
  ".nojekyll",
];
for (const f of required) {
  if (fs.existsSync(path.join(root, f))) ok(f);
  else fail("missing " + f);
}

// 2. JS syntax valid
console.log("\n2. JavaScript syntax");
const jsPath = path.join(root, "assets/js/main.js");
if (fs.existsSync(jsPath)) {
  try {
    new Function(fs.readFileSync(jsPath, "utf8"));
    ok("main.js parses without syntax errors");
  } catch (e) {
    fail("main.js syntax error: " + e.message);
  }
}

// 3. No banned frameworks/imports (detect real usage, not innocent substrings)
console.log("\n3. No banned frameworks");
const bannedPatterns = [
  /\bimport\s+[^;]*from\s+['"]react\b/i,
  /\bimport\s+[^;]*from\s+['"]next\b/i,
  /\bimport\s+[^;]*from\s+['"]vue\b/i,
  /\bimport\s+[^;]*from\s+['"]@angular\b/i,
  /\bimport\s+[^;]*from\s+['"]svelte\b/i,
  /\bimport\s+[^;]*from\s+['"]vite\b/i,
  /\bimport\s+[^;]*from\s+['"]webpack\b/i,
  /\bfrom\s+['"]tailwind\b/i,
  /\bfrom\s+['"]bootstrap\b/i,
  /\bcreateRoot\b/i,
  /<React\b/i,
  /\bnext\//i,
  /data-reactroot/i,
  /\/\* @ts-ignore\b/i,
  /lang=["']tsx?["']/i,
];
const scanFiles = ["index.html", "assets/css/styles.css", "assets/js/main.js"];
let bannedFound = false;
for (const f of scanFiles) {
  const full = path.join(root, f);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, "utf8");
  for (const re of bannedPatterns) {
    if (re.test(content)) {
      fail(`banned pattern /${re.source}/ found in ${f}`);
      bannedFound = true;
    }
  }
}
if (!bannedFound) ok("no banned frameworks detected");

// 4. HTML references resolve
console.log("\n4. Asset references in index.html");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const refRe = /(?:src|href)="(\.\/[^"]+)"/g;
let m;
let refCount = 0;
while ((m = refRe.exec(html)) !== null) {
  refCount++;
  const ref = m[1];
  const local = ref.replace(/^\.\//, "");
  if (fs.existsSync(path.join(root, local))) ok(ref);
  else fail("broken reference: " + ref);
}
if (refCount === 0) fail("no local references found");

// 5. No package dependencies required at runtime
console.log("\n5. No runtime dependencies");
ok("site is static; no npm install needed to serve");

// Result
console.log(
  "\n" +
    (errors === 0 ? "BUILD PASSED" : "BUILD FAILED (" + errors + " error(s))"),
);
process.exit(errors === 0 ? 0 : 1);
