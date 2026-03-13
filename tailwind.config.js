/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {

        brand: {

          primary: "#00C2D6",
          "primary-hover": "#00A8BA",
          "primary-soft": "#E6FAFD",

          secondary: "#FF7A59",

          accent: "#A78BFA",

          mint: "#2DD4BF",

          bg: "#FAFEFF",
          "bg-soft": "#F2FBFD",

          surface: "#FFFFFF",

          text: "#1F2937",
          "text-muted": "#6B7280",
          "text-soft": "#9CA3AF",

          border: "#E5F3F7",
          "border-strong": "#CFE8EF",
        }

      }
    }

  },

  plugins: [],
}
