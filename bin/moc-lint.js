#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);

function resolveEslintBin() {
  // 1) Find eslint's package.json (works whether hoisted at app root or nested in this pkg)
  const eslintPkgJsonPath = require.resolve("eslint/package.json");
  const eslintDir = dirname(eslintPkgJsonPath);

  // 2) Read its "bin" field to get the CLI entry
  const pkg = JSON.parse(readFileSync(eslintPkgJsonPath, "utf8"));
  const binRel = (pkg.bin && (pkg.bin.eslint || pkg.bin)) || "bin/eslint.js"; // fallback

  // 3) Make absolute path to CLI
  return resolve(eslintDir, typeof binRel === "string" ? binRel : binRel.eslint);
}

let eslintBin;
try {
  eslintBin = resolveEslintBin();
} catch (e) {
  console.error(
    "[moc-lint] Could not resolve ESLint. Ensure @mohammad_obed/config has eslint in dependencies or the project has eslint installed.",
  );
  console.error("Error details:", e);
  process.exit(1);
}

const args = process.argv.slice(2);
const finalArgs = args.length ? args : ["--max-warnings=0", "."];

const result = spawnSync(process.execPath, [eslintBin, ...finalArgs], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 0);
