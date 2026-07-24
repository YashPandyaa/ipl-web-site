import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          light: '#FFFFFF',
          dark: '#122019',
        },
        'surface-2': 'var(--surface-2)',
        pitch: 'var(--bg)',
        turf: {
          DEFAULT: 'var(--surface)',
          light: '#EFEBDD',
          dark: '#122019',
        },
        'turf-2': 'var(--surface-2)',
        chalk: 'var(--text-primary)',
        sage: {
          DEFAULT: 'var(--text-secondary)',
          dim: 'var(--text-muted)',
        },
        amber: {
          DEFAULT: 'var(--accent)',
          dim: 'var(--accent-strong)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          strong: 'var(--danger-strong)',
        },
        red: {
          DEFAULT: 'var(--danger)',
          dim: 'var(--danger-strong)',
        },
        line: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        // Mapped values for backward compatibility and style sync
        base: {
          light: '#F7F5EE',
          dark: '#0C1712',
          DEFAULT: 'var(--bg)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
          light: 'rgba(22, 36, 28, 0.10)',
          dark: 'rgba(241, 237, 225, 0.09)',
        },
        brand: {
          DEFAULT: 'var(--accent)',
          dark: 'var(--accent-strong)',
          light: 'var(--accent)',
        },
        gold: {
          DEFAULT: 'var(--accent)',
          dark: 'var(--accent-strong)',
          light: 'var(--text-primary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          strong: 'var(--accent-strong)',
          contrast: 'var(--accent-contrast)',
          green: { light: '#1F6F4A', dark: '#1F6F4A' },
          red: { light: '#B23A2E', dark: '#D6553B' },
          purple: { light: '#F4A93B', dark: '#F4A93B' },
          orange: '#F4A93B',
        },
        text: {
          DEFAULT: 'var(--text-primary)',
          primary: { light: '#16241C', dark: '#F1EDE1', DEFAULT: 'var(--text-primary)' },
          secondary: { light: '#4C5C51', dark: '#8FA396', DEFAULT: 'var(--text-secondary)' },
          muted: { light: '#7C8B80', dark: '#5E6E64', DEFAULT: 'var(--text-muted)' },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-anton)", "Impact", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
