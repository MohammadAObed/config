/** @import { Config } from "prettier" */

/**
 * The only Prettier configuration to use in your project’s `package.json`.
 *
 * @remarks
 * - Enforces consistent formatting across all projects.
 * - Matches ESLint rules to avoid conflicts (e.g., via `eslint-config-prettier`).
 * - Intended to be the single source of truth — extend or override locally only if needed.
 *
 * @example
 * - Add this line of code to your project's `package.json`:
 * ```json
 * "prettier": "@mohammad_obed/config/prettier.config"
 * ```
 *
 * @see {@link https://prettier.io/docs/en/options.html Prettier Options}
 *
 * @type {Config}
 */
const config = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  objectWrap: "preserve",
  arrowParens: "always",
  requirePragma: false,
  insertPragma: false,
  checkIgnorePragma: false,
  htmlWhitespaceSensitivity: "css",
  endOfLine: "lf",
  embeddedLanguageFormatting: "auto",
  singleAttributePerLine: false,
  proseWrap: "preserve",
};

export default config;
