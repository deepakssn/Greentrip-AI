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
          950: "#090b07",
          900: "#0e110a",
          800: "#141810",
          700: "#1d2317",
          600: "#28301e",
        },
        brand: {
          50: "#f5f8ee",
          100: "#e9f1d9",
          200: "#d5e4b6",
          300: "#c2d795",
          400: "#aec479",
          500: "#97b158",
          600: "#7c9644",
          700: "#617338",
          800: "#4d5b31",
          900: "#414d2d",
        },
        accent: {
          cyan: "#5ec9b1",
          violet: "#e0b25a",
          pink: "#e08a6a",
          lime: "#cfe08a",
        },
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(174,196,121,0.34) 0%, rgba(124,150,68,0.18) 35%, rgba(9,11,7,0) 75%)",
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(151,177,88,0.55)",
        glowViolet: "0 0 60px -10px rgba(224,178,90,0.5)",
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
