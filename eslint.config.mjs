import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { plugin as shadcn } from "@shadcn/lint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Ignore `_`-prefixed unused function args (intentional stub params,
  // e.g. a `getBlob` seam method whose transport lands at Plan 012).
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", args: "after-used" },
      ],
    },
  },
  // @shadcn/lint: plugin registered, no rules enabled yet — component/theme
  // discovery is automatic via components.json. Rule selection is a design
  // decision for the design-system-overhaul slice, not bundled here.
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { shadcn },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
