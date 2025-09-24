#!/usr/bin/env node
/**
 * @packageDocumentation
 * CLI entry for `moc-run`.
 *
 * Thin wrapper around the `tsx` runtime that auto-selects a default script and forwards flags untouched.
 *
 * Used mostly to run a typescript/javascript file, useful for testing.
 *
 * @remarks
 * Looks for `dev.ts` or `dev.tsx` when no entry point is supplied, resolves relative paths for cross-platform usage, and exits if no script can be found.
 *
 * @example
 * ```bash
 * npx moc-run
 * npx moc-run src/playground.tsx --watch
 * ```
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const CWD = process.cwd();

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

let tsxBin;
try {
  tsxBin = resolveBin("tsx", "tsx");
} catch (e) {
  console.error("[moc-run] Could not resolve 'tsx'. Ensure @mohammad_obed/config depends on it.");
  console.error("Details:", e?.message || e);
  process.exit(1);
}

const args = process.argv.slice(2);

// If no args, pick default file: dev.ts or dev.tsx at consumer root
function pickDefaultScript() {
  const candidates = ["dev.ts", "dev.tsx"];
  for (const file of candidates) {
    const abs = resolve(CWD, file);
    if (existsSync(abs)) return abs;
  }
  return null;
}

let finalArgs = args;
if (finalArgs.length === 0) {
  const def = pickDefaultScript();
  if (!def) {
    console.error(
      "[moc-run] No target script provided and no default file found.\n" +
        "Create one of: dev.ts or dev.tsx at your project root, or run: npx moc-run path/to/file.ts",
    );
    process.exit(1);
  }
  finalArgs = [def];
} else {
  // If first arg is a relative path, resolve it so Windows paths work cleanly
  const first = finalArgs[0];
  if (!first.startsWith("-")) {
    finalArgs[0] = resolve(CWD, first);
  }
}

// Execute tsx with user args (supports --watch, --tsconfig, NODE_OPTIONS, etc.)
const r = spawnSync(process.execPath, [tsxBin, ...finalArgs], {
  stdio: "inherit",
  env: process.env,
});
process.exit(r.status ?? 0);
