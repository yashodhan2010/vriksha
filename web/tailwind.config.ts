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
      boxShadow: {
        soft: "0 18px 50px rgba(24, 33, 31, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
