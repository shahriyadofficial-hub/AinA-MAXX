import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#EDEDED",
        aina: {
          black: "#0A0A0A", // Jet Black
          graphite: "#1A1A1D", // Graphite Cards/Surface
          dark: "#121214", // Elevated Surface
          border: "#2A2A2E", // Subtle borders
          rose: "#FF2D95", // Neon Rose Accent
          cerulean: "#007BA7", // Cerulean Blue
          "light-cerulean": "#3FB6E0", // Light Cerulean Accent
          muted: "#94949E",
          card: "#161619",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        bengali: ["var(--font-noto-bengali)", "sans-serif"],
      },
      borderRadius: {
        'aina': '24px',
        'aina-sm': '16px',
        'aina-lg': '32px',
      },
      boxShadow: {
        'glow-rose': '0 0 25px -5px rgba(255, 45, 149, 0.4)',
        'glow-cerulean': '0 0 25px -5px rgba(0, 123, 167, 0.4)',
      }
    },
  },
  plugins: [],
};

export default config;
