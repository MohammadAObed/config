#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);

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
  console.error("[moc-build] Could not resolve tsup:", e?.message || e);
  process.exit(1);
}

const args = process.argv.slice(2);
const r = spawnSync(process.execPath, [tsupBin, ...args], {
  stdio: "inherit",
  env: process.env,
});
process.exit(r.status ?? 0);
