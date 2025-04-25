import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      "greenlight": {
        extend: "dark", // <- inherit default values from dark theme
        colors: {
          background: "#1a1b1e",
          cardBackground: "#cccccc",
          foreground: "#ffffff",
          primary: {
            50: "#001F10",
            100: "#00381D",
            200: "#006132",
            300: "#00703A",
            400: "#007A3F",
            500: "#008746",
            600: "#00BD61",
            700: "#00E677",
            800: "#75FFBC",
            900: "#CCFFE6",
            DEFAULT: "#008746",
            foreground: "#ffffff",
          },
          focus: "#F182F6",
        },
        layout: {
          disabledOpacity: "0.3",
          radius: {
            small: "4px",
            medium: "6px",
            large: "8px",
          },
          borderWidth: {
            small: "1px",
            medium: "2px",
            large: "3px",
          },
        },
      },
    },
  })],
}
