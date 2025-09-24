/** @import { Options } from "tsup" */
import { defineConfig } from "tsup";

const isProduction = true;

/**
 * The only tsup build configuration to import and use in your project’s `tsup.config.ts` file.
 *
 * @remarks
 * - Outputs modern ESM (`.mjs`) bundles with type declarations.
 * - Cleans previous builds and applies tree-shaking by default.
 * - no `sourcemap`, and its `minified`.
 * - Accepts extra {@link Options | tsup options} via the `options` parameter for extension.
 *
 * @example
 * - Create `tsup.config.ts` in your project root folder, then add the code below
 * ```ts
 * import defineConfig from "@mohammad_obed/config/tsup.config";
 *
 * export default defineConfig({
 *   entry: ["src"], // add/edit subpaths as needed
 *   outDir: "dist",
 * });
 * ```
 *
 * @see {@link https://tsup.egoist.dev | tsup Documentation}
 *
 * @param {Options} options
 */
const config = (options) =>
  defineConfig({
    format: ["esm"],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: !isProduction,
    minify: isProduction,
    target: "esnext",
    platform: "neutral",
    treeshake: true,
    skipNodeModulesBundle: true,
    external: [], // maybe list peer deps here if you add any
    keepNames: false,
    outExtension: () => ({ js: ".mjs" }),
    ...options,
  });

export default config;
