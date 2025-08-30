#!/usr/bin/env node
// bin/moc-size.js
// ESM wrapper around Size Limit JS API with folder/glob support + styled output

import fg from "fast-glob";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pc from "picocolors";

const require = createRequire(import.meta.url);
const CWD = process.cwd();
const __DIR__ = dirname(fileURLToPath(import.meta.url));
const interop = (m) => (m && typeof m === "object" && "default" in m ? m.default : m);

function parseArgs(argv) {
  const out = { paths: [], preset: null, limit: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--preset") out.preset = (argv[++i] || "").toLowerCase();
    else if (a === "--limit") out.limit = argv[++i] || null;
    else out.paths.push(a);
  }
  return out;
}

function parseLimitToBytes(input) {
  if (!input) return null;
  const m = String(input)
    .trim()
    .match(/^([\d.]+)\s*(kb|kB|KB|b|B)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (Number.isNaN(n)) return null;
  const unit = (m[2] || "kB").toLowerCase();
  // Size Limit uses decimal kB (1000 bytes)
  return unit === "b" ? n : n * 1000;
}

function readConsumerSizeLimitConfig() {
  const pkgPath = resolve(CWD, "package.json");
  if (!existsSync(pkgPath)) return null;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const cfg = pkg["size-limit"];
    if (!cfg) return null;
    const first = Array.isArray(cfg) ? cfg[0] : cfg;
    return {
      paths: first?.path ? (Array.isArray(first.path) ? first.path : [first.path]) : null,
      preset: first?.preset || null,
      limit: first?.limit || null,
    };
  } catch {
    return null;
  }
}

function pickPreset(name) {
  const key = (name || "").toLowerCase();
  const map = {
    app: "@size-limit/preset-app",
    big: "@size-limit/preset-big-lib",
    "big-lib": "@size-limit/preset-big-lib",
    small: "@size-limit/preset-small-lib",
    "small-lib": "@size-limit/preset-small-lib",
  };
  const pkg = map[key] || map.small;
  try {
    return interop(require(pkg));
  } catch (e) {
    console.error(
      `[moc-size] Failed to load preset "${pkg}". Ensure your config package depends on it.\n${e?.message || e}`,
    );
    process.exit(1);
  }
}

function normalizeToFiles(inputPaths) {
  if (!inputPaths || inputPaths.length === 0) return [];
  const patterns = [];
  for (const raw of inputPaths) {
    const abs = resolve(CWD, raw);
    let isDir = false;
    try {
      isDir = statSync(abs).isDirectory();
    } catch {}
    // If folder → measure ALL files inside (any extension)
    const pattern = isDir ? `${abs.replace(/\\/g, "/")}/**/*` : abs.replace(/\\/g, "/");
    patterns.push(pattern);
  }
  // Expand to files, exclude sourcemaps & node_modules
  const files = fg.sync(patterns, {
    onlyFiles: true,
    dot: false,
    ignore: ["**/*.map", "**/node_modules/**"],
  });
  return files;
}

function kbString(bytes) {
  return (bytes / 1000).toFixed(2) + " kB";
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const consumer = readConsumerSizeLimitConfig();

  const presetName = args.preset || consumer?.preset || "small";
  const preset = pickPreset(presetName);
  const plugins = Array.isArray(preset) ? preset : [preset];

  const rawPaths = args.paths.length
    ? args.paths
    : consumer?.paths?.length
      ? consumer.paths
      : ["dist"];
  const files = normalizeToFiles(rawPaths);
  if (!files.length) {
    console.error("[moc-size] No files matched. Build first or adjust your path/glob.");
    process.exit(1);
  }

  const limitBytes = parseLimitToBytes(args.limit || consumer?.limit || null);

  const sizeLimit = interop(require("size-limit"));
  const results = await sizeLimit(plugins, files);
  const list = Array.isArray(results) ? results : [results];

  // Size Limit returns one result when measuring a set; if multiple,
  // print each. We’ll compare each against the same limit if provided.
  let failed = false;

  for (const r of list) {
    const bytes = typeof r.size === "number" ? r.size : Number(r.size);
    const within = limitBytes == null || bytes <= limitBytes;

    // Styled lines similar to upstream CLI
    if (limitBytes != null) {
      console.log(
        "  " +
          "Size limit: " +
          (within ? pc.green(kbString(limitBytes)) : pc.red(kbString(limitBytes))),
      );
    }
    console.log(
      "  " +
        "Size:       " +
        (within ? pc.green(kbString(bytes)) : pc.red(kbString(bytes))) +
        " " +
        pc.gray("with all dependencies, minified and brotli"),
    );

    if (!within) failed = true;
    // Blank line between multiple targets
    if (list.length > 1) console.log("");
  }

  if (limitBytes != null) {
    process.exit(failed ? 1 : 0);
  }
}

run().catch((e) => {
  console.error("[moc-size] Unexpected error:", e?.stack || e?.message || e);
  process.exit(1);
});
