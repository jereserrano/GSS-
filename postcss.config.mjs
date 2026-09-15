/* ── PostCSS: pipeline de transformación CSS ── */
const config = {
  plugins: {
    /* Tailwind CSS v4 usa su propio plugin PostCSS */
    "@tailwindcss/postcss": {},
    /* Autoprefixer agrega prefijos de vendor (-webkit-, -moz-, etc.) automáticamente */
    autoprefixer: {},
  },
};

export default config;
