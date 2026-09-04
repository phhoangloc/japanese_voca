import type { Config } from "tailwindcss";

/**
 * Palette + type mirror the Claude Design canvas "Thiết kế trang admin Projek":
 * Manrope, deep-green accent (oklch 0.32 0.07 155), warm-mint page ground,
 * rounded white cards. Colors carry `<alpha-value>` so Tailwind's `/opacity`
 * modifiers work.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "oklch(0.96 0.02 155 / <alpha-value>)",
          100: "oklch(0.93 0.05 155 / <alpha-value>)",
          200: "oklch(0.88 0.06 155 / <alpha-value>)",
          300: "oklch(0.78 0.08 155 / <alpha-value>)",
          400: "oklch(0.55 0.10 155 / <alpha-value>)",
          500: "oklch(0.42 0.08 155 / <alpha-value>)",
          600: "oklch(0.32 0.07 155 / <alpha-value>)",
          700: "oklch(0.27 0.06 155 / <alpha-value>)",
          800: "oklch(0.22 0.05 155 / <alpha-value>)",
          900: "oklch(0.18 0.03 150 / <alpha-value>)",
        },
        ink: {
          DEFAULT: "oklch(0.24 0.01 150 / <alpha-value>)",
          soft: "oklch(0.50 0.01 150 / <alpha-value>)",
          faint: "oklch(0.60 0.01 150 / <alpha-value>)",
        },
        paper: "oklch(0.965 0.006 150 / <alpha-value>)",
        surface: "#ffffff",
        line: {
          DEFAULT: "oklch(0.88 0.005 150 / <alpha-value>)",
          soft: "oklch(0.93 0.005 150 / <alpha-value>)",
          faint: "oklch(0.96 0.005 150 / <alpha-value>)",
        },
        night: "oklch(0.22 0.01 150 / <alpha-value>)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: [
          "var(--font-manrope)",
          "Manrope",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
