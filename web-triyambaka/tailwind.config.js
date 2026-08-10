/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#05060a",
          900: "#0a0b12",
          800: "#0f1118",
          700: "#161824",
          600: "#1f2230",
        },
        brand: {
          50: "#eef4ff",
          100: "#dde7ff",
          200: "#b9ccff",
          300: "#8ba8ff",
          400: "#5a7eff",
          500: "#3a58ff",
          600: "#2a3df0",
          700: "#222ec4",
          800: "#1f2999",
          900: "#1c2578",
        },
        accent: {
          cyan: "#22d3ee",
          violet: "#8b5cf6",
          pink: "#ec4899",
          lime: "#a3e635",
        },
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(58,88,255,0.35) 0%, rgba(139,92,246,0.18) 35%, rgba(5,6,10,0) 75%)",
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(58,88,255,0.55)",
        glowViolet: "0 0 60px -10px rgba(139,92,246,0.55)",
      },
      animation: {
        "spin-slow": "spin 18s linear infinite",
        "pulse-slow": "pulse 6s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        "gradient-x": "gradient-x 12s ease infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
