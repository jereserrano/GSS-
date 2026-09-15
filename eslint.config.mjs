/* ── ESLint: reglas de calidad de código ── */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  /* Configuración base de Next.js: incluye React, TypeScript y reglas de App Router */
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      /* 
       * Prohibir el uso de `any` explícito.
       * Solo se permite con comentario justificativo: // eslint-disable-next-line @typescript-eslint/no-explicit-any
       */
      "@typescript-eslint/no-explicit-any": "error",
      /* Asegurar que las promesas siempre se manejen (await o .then/.catch) */
      "@typescript-eslint/no-floating-promises": "error",
      /* Prohibir valores no utilizados en desestructuración */
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
];

export default eslintConfig;
