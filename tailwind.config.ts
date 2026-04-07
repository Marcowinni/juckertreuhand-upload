import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#114c81",
        "navy-dark": "#0d3a63",
        "navy-light": "#1a6bb5",
        charcoal: "#161922",
        background: "#ffffff",
        foreground: "#161922",
      },
      fontFamily: {
        heading: ["Oswald", "Arial", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        heading: "0.08em",
      },
    },
  },
  plugins: [],
};
export default config;
