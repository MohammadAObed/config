#!/usr/bin/env node
// bin/moc-build-all.js
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

function resolveBin(pkgName, binKey) {
  const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
  const dir = dirname(pkgJsonPath);
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  const binField = pkg.bin;
  const rel =
    typeof binField === "string"
      ? binField
      : binKey && binField?.[binKey]
        ? binField[binKey]
        : Object.values(binField || {})[0];
  if (!rel) throw new Error(`No bin found in ${pkgName}`);
  return resolve(dir, rel);
}

let tsupBin;
try {
  tsupBin = resolveBin("tsup", "tsup");
} catch (e) {
  console.error("[moc-build-all] Could not resolve tsup:", e?.message || e);
  process.exit(1);
}

// ❇️ Run our own moc-size by path within this package (no exports needed)
const mocSizeBin = resolve(here, "moc-size.js");

// Forward all CLI args to tsup (e.g. --watch, --minify)
const args = process.argv.slice(2);

// 1) Build
const r1 = spawnSync(process.execPath, [tsupBin, ...args], {
  stdio: "inherit",
  env: process.env,
});
if ((r1.status ?? 0) !== 0) process.exit(r1.status ?? 1);

// 2) Size (pretty API-based checker)
const r2 = spawnSync(process.execPath, [mocSizeBin], {
  stdio: "inherit",
  env: process.env,
});
process.exit(r2.status ?? 0);
