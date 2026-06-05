import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GardZen Zen palette — earthy, warm, grounded
        garden: {
          50: "#f4f9f1",
          100: "#e5f2de",
          200: "#cce5bd",
          300: "#a8d094",
          400: "#7db56a",
          500: "#5a9848",
          600: "#437a34",
          700: "#35612a",
          800: "#2c4e24",
          900: "#25411e",
        },
        soil: {
          50: "#faf7f2",
          100: "#f3ece0",
          200: "#e6d6be",
          300: "#d4ba96",
          400: "#bf986a",
          500: "#b07f4e",
          600: "#9a6840",
          700: "#815237",
          800: "#6a4332",
          900: "#58382c",
        },
        zen: {
          50: "#f8faf7",
          100: "#eef4eb",
          200: "#d5e8cc",
          300: "#afd4a3",
          400: "#82b973",
          500: "#5e9e4d",
          600: "#487d3a",
          700: "#3a6230",
          800: "#30502a",
          900: "#294324",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "sprout": {
          "0%": { transform: "scaleY(0.9)", opacity: "0.7" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "sprout": "sprout 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
