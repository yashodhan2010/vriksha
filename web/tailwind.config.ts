import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18211f",
        paper: "#f7f4ef",
        line: "#ded8cd",
        moss: "#476252",
        pine: "#1f3a33",
        clay: "#a55f45",
        gold: "#c39b43",
        sky: "#dbe8ef"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"]
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter: "-0.02em",
        snug: "-0.01em"
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        md: "10px",
        lg: "14px",
        xl: "20px"
      },
      boxShadow: {
        xs: "0 1px 2px rgba(24, 33, 31, 0.06)",
        sm: "0 4px 16px rgba(24, 33, 31, 0.06)",
        soft: "0 18px 50px rgba(24, 33, 31, 0.09)",
        lift: "0 22px 60px rgba(24, 33, 31, 0.14)"
      },
      transitionDuration: {
        180: "180ms",
        250: "250ms",
        350: "350ms"
      }
    }
  },
  plugins: []
};

export default config;
