import type { Config } from "tailwindcss";

/**
 * Palette mirrors the Claude Design canvas "Góc sách - thư viện đọc" (warm peach
 * ground `#FFECE0`, terracotta accents). Type is "M PLUS 1p" throughout
 * (home-idea.md), used at heavier weights for the display role. Colors carry
 * `<alpha-value>` so Tailwind's `/opacity` modifiers work.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFECE0",
        ink: {
          DEFAULT: "oklch(0.22 0.03 50 / <alpha-value>)",
          soft: "oklch(0.32 0.03 50 / <alpha-value>)",
          faint: "oklch(0.45 0.02 50 / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(0.5 0.12 40 / <alpha-value>)",
          deep: "oklch(0.4 0.14 40 / <alpha-value>)",
        },
        night: "oklch(0.3 0.02 60 / <alpha-value>)",
        line: "oklch(0.87 0.01 60 / <alpha-value>)",
      },
      fontFamily: {
        sans: [
          "var(--font-mplus)",
          '"M PLUS 1p"',
          "system-ui",
          '"Hiragino Sans"',
          '"Yu Gothic"',
          "Meiryo",
          "sans-serif",
        ],
        // Same face — headings/wordmark just use a heavier weight.
        display: [
          "var(--font-mplus)",
          '"M PLUS 1p"',
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.4s ease",
      },
    },
  },
  plugins: [],
};

export default config;
