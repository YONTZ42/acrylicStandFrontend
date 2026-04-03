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
        },
        y2k: {
          pink: "#FF7EB3",
          purple: "#A87FFB",
          mint: "#5EEAD4",
          blue: "#7DD3FC",
          // グラスモーフィズム用
          glass: "rgba(255, 255, 255, 0.2)",
          glassDark: "rgba(0, 0, 0, 0.3)",
        }
      },
      backgroundImage: {
        'holo-gradient': 'linear-gradient(135deg, #FF7EB3 0%, #A87FFB 50%, #5EEAD4 100%)',
      },
      boxShadow: {
        'neon-pink': '0 0 15px rgba(255, 126, 179, 0.6)',
        'neon-blue': '0 0 15px rgba(0, 194, 214, 0.6)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
      }
    

    }

  },

  plugins: [],
}
