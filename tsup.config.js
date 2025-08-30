// https://esbuild.github.io/api
/** @import { Options } from "tsup" */
import { defineConfig } from "tsup";

const isProduction = true;

/**
 * @param {Options} options
 * @returns {ReturnType<typeof defineConfig>}
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
