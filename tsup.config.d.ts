declare module "@mohammad_obed/config/tsup.config" {
  import type { defineConfig, Options } from "tsup";
  type DefineConfig = typeof defineConfig;
  const config: (options?: Options) => ReturnType<DefineConfig>;
  export default config;
}
