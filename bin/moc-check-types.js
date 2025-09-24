#!/usr/bin/env node
/**
 * @packageDocumentation
 * CLI entry for `moc-check-types`.
 *
 * Runs the local TypeScript compiler in no-emit mode to surface type errors across the project.
 *
 * @remarks
 * Resolves the `tsc` binary shipped with the consumer (or the config package) and defaults to `--noEmit`, making it safe in CI.
 *
 * @example
 * ```bash
 * npx moc-check-types
 * npx moc-check-types --project tsconfig.build.json
 * ```
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);

function resolveTscBin() {
  const tsPkgPath = require.resolve("typescript/package.json");
  const tsDir = dirname(tsPkgPath);
  const pkg = JSON.parse(readFileSync(tsPkgPath, "utf8"));
  const binRel = (pkg.bin && (pkg.bin.tsc || pkg.bin)) || "bin/tsc";
  return resolve(tsDir, typeof binRel === "string" ? binRel : binRel.tsc);
}

let tscBin;
try {
  tscBin = resolveTscBin();
} catch (e) {
  console.error(
    "[moc-check-types] Could not resolve TypeScript. Ensure @mohammad_obed/config depends on 'typescript' or install it in the project.",
  );
  console.error("Error details:", e);
  process.exit(1);
}

// Default: check types without emitting, use project tsconfig if present.
const args = process.argv.slice(2);
const finalArgs = args.length ? args : ["--noEmit"];

const result = spawnSync(process.execPath, [tscBin, ...finalArgs], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 0);
