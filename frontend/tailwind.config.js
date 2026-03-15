/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: "var(--c-surface)",
        card: "var(--c-card)",
        "border-subtle": "var(--c-border)",
        t1: "var(--c-text-1)",
        t2: "var(--c-text-2)",
        t3: "var(--c-text-3)",
        accent: "#d97706",
        "accent-hover": "#b45309",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        "celebrate": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "30%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "ping-once": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "75%": { transform: "scale(1.5)", opacity: "0" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        "slide-up": "slide-up 0.3s ease-out",
        pop: "pop 0.35s ease-in-out",
        celebrate: "celebrate 0.5s ease-in-out",
        "ping-once": "ping-once 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
