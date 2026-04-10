import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Color System (from Google Stitch)
        // Primary
        primary: "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#1e1b18",
        "on-primary-container": "#89837e",
        "primary-fixed": "#e9e1dc",
        "on-primary-fixed": "#1e1b18",
        "primary-fixed-dim": "#ccc5c0",
        "on-primary-fixed-variant": "#4a4642",

        // Secondary (Terracotta accent)
        secondary: "#84523c",
        "on-secondary": "#ffffff",
        "secondary-container": "#fdba9f",
        "on-secondary-container": "#794833",
        "secondary-fixed": "#ffdbcd",
        "on-secondary-fixed": "#341102",
        "secondary-fixed-dim": "#fab79c",
        "on-secondary-fixed-variant": "#693b27",

        // Tertiary
        tertiary: "#000000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#1b1b1d",
        "on-tertiary-container": "#858386",
        "tertiary-fixed": "#e5e1e4",
        "on-tertiary-fixed": "#1b1b1d",
        "tertiary-fixed-dim": "#c8c6c8",
        "on-tertiary-fixed-variant": "#474649",

        // Error
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // Surface & Background
        background: "#fcf9f5",
        "on-background": "#1c1c1a",
        surface: "#fcf9f5",
        "on-surface": "#1c1c1a",
        "surface-dim": "#dcdad6",
        "surface-bright": "#fcf9f5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3ef",
        "surface-container": "#f0ede9",
        "surface-container-high": "#eae8e4",
        "surface-container-highest": "#e5e2de",

        // Surface variants
        "surface-variant": "#e5e2de",
        "on-surface-variant": "#4c4640",

        // Outline
        outline: "#7d766f",
        "outline-variant": "#cfc5bd",

        // Inverse
        "inverse-surface": "#31302e",
        "inverse-on-surface": "#f3f0ec",
        "inverse-primary": "#ccc5c0",

        // Surface tint
        "surface-tint": "#625d59",
      },
      borderRadius: {
        DEFAULT: "0.25rem", // 4px
        lg: "0.5rem", // 8px
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
        "3xl": "1.5rem", // 24px
        full: "9999px",
      },
      fontFamily: {
        headline: ["var(--font-inter)", "Inter", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        label: ["var(--font-inter)", "Inter", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      fontSize: {
        // Display - Large headlines
        "display-lg": ["57px", { lineHeight: "64px", fontWeight: "900" }],
        "display-md": ["45px", { lineHeight: "52px", fontWeight: "900" }],
        "display-sm": ["36px", { lineHeight: "44px", fontWeight: "900" }],

        // Headline
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "800" }],
        "headline-md": ["28px", { lineHeight: "36px", fontWeight: "800" }],
        "headline-sm": ["24px", { lineHeight: "32px", fontWeight: "800" }],

        // Title
        "title-lg": ["22px", { lineHeight: "28px", fontWeight: "700" }],
        "title-md": ["16px", { lineHeight: "24px", fontWeight: "700" }],
        "title-sm": ["14px", { lineHeight: "20px", fontWeight: "700" }],

        // Body
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],

        // Label
        "label-lg": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "600" }],
        "label-sm": ["11px", { lineHeight: "16px", fontWeight: "600" }],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 4px 12px rgba(28, 28, 26, 0.06)",
        md: "0 4px 24px rgba(28, 28, 26, 0.06)",
        lg: "0 12px 32px rgba(28, 28, 26, 0.08)",
        xl: "0 20px 48px rgba(28, 28, 26, 0.12)",
        "2xl": "0 24px 64px -16px rgba(28, 28, 26, 0.16)",
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'accordion-down': 'accordion-down 0.3s ease-out',
        'accordion-up': 'accordion-up 0.25s ease-in',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height, auto)', opacity: '1' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height, auto)', opacity: '1' },
          to: { height: '0', opacity: '0' },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

export default config;
