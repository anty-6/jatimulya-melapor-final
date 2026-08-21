import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef4f9",
          100: "#d8e6f0",
          200: "#bcd4e6",
          600: "#155e85",
          700: "#0f4a6b",
          800: "#0c3a54",
          900: "#0a2d40",
        },
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;