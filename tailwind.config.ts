import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#f8fafc",
        line: "#d8dee8",
        accent: "#0f766e",
      },
    },
  },
  plugins: [],
};

export default config;
