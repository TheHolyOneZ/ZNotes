/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: {
          50: "rgba(255,255,255,0.03)",
          100: "rgba(255,255,255,0.06)",
          200: "rgba(255,255,255,0.08)",
          300: "rgba(255,255,255,0.12)",
          400: "rgba(255,255,255,0.16)",
          border: "rgba(255,255,255,0.08)",
          "border-strong": "rgba(255,255,255,0.14)",
        },
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "16px",
        md: "20px",
        lg: "32px",
        xl: "48px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "orb-1": "orb1 20s ease-in-out infinite",
        "orb-2": "orb2 25s ease-in-out infinite",
        "orb-3": "orb3 30s ease-in-out infinite",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        orb1: {
          "0%,100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%": { transform: "translate(5%, -8%) scale(1.05)" },
          "66%": { transform: "translate(-3%, 5%) scale(0.97)" },
        },
        orb2: {
          "0%,100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%": { transform: "translate(-6%, 4%) scale(1.08)" },
          "66%": { transform: "translate(4%, -6%) scale(0.95)" },
        },
        orb3: {
          "0%,100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(3%, 6%) scale(1.04)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
