import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: "#FF6B35",
          yellow: "#FFC107",
          blue: "#2196F3",
          "blue-light": "#E3F2FD",
          "blue-dark": "#1976D2",
        },
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "sans-serif"],
        condensed: ["var(--font-roboto-condensed)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

