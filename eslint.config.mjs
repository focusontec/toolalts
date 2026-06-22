import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn",
      "prefer-const": "warn",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
];

export default eslintConfig;
