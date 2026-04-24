import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F4F2",
        card: "#FFFFFF",
        hairline: "#E8E8E6",
        sidebar: {
          active: "#F0EFEC",
        },
        ink: {
          DEFAULT: "#141413",
          muted: "#6B6A66",
          subtle: "#A3A29D",
        },
        accent: {
          DEFAULT: "#FF5B8A",
          soft: "#FFE4EC",
        },
        pill: {
          pink: "#FFE4EC",
          pinkInk: "#B93963",
          green: "#E4F1E5",
          greenInk: "#3F7A48",
          neutral: "#EFEEEB",
          neutralInk: "#5C5B57",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      fontSize: {
        "display": ["34px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};

export default config;
