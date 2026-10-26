// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: {
          950: '#07090e',
          900: '#0c1017',
          850: '#101622',
          800: '#151d2c',
          700: '#1e293b',
          600: '#334155',
        },
        cyber: {
          cyan: '#06b6d4',
          glow: '#22d3ee',
          blue: '#3b82f6',
          emerald: '#10b981',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 24px -4px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
