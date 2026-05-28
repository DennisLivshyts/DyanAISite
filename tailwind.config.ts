import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050D1A",
          900: "#0A1628",
          800: "#0F2040",
          700: "#162B55",
        },
        green: {
          700: "#1B4332",
          600: "#2D6A4F",
          500: "#40916C",
          400: "#52B788",
          300: "#74C69D",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        syne: ["Space Grotesk", "sans-serif"],
        "space-mono": ["Space Mono", "monospace"],
        mono: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
