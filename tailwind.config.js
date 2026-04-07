/** @type {import('tailwindcss').Config} */
export default {
  content:[
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // 洗練されたシャンパンゴールド/ブロンズ系
          primary: "#C5A880",
          "primary-hover": "#B0926A",
          "primary-soft": "#F9F6F0",

          // 上品なダークチャコール
          secondary: "#2C2A29",

          accent: "#D9C5B2",
          mint: "#8EAEB4",

          // 温かみのあるオフホワイト基調
          bg: "#FAF9F6",
          "bg-soft": "#F2F0EB",

          surface: "#FFFFFF",

          // テキストカラーも真っ黒を避ける
          text: "#1C1C1E",
          "text-muted": "#736F68",
          "text-soft": "#A6A29C",

          // 細く上品なボーダー
          border: "#E8E6E1",
          "border-strong": "#D1CCC2",
        },
        y2k: {
          pink: "#E8B4B8",
          purple: "#BCA3C4",
          mint: "#A3C4BC",
          blue: "#A3B8C4",
          glass: "rgba(255, 255, 255, 0.15)",
          glassDark: "rgba(0, 0, 0, 0.4)",
        }
      },
      fontFamily: {
        sans:['"Helvetica Neue"', 'Arial', '"Hiragino Kaku Gothic ProN"', '"Hiragino Sans"', 'Meiryo', 'sans-serif'],
        serif:['"Playfair Display"', '"Noto Serif JP"', 'Mincho', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
        'elegant': '0 10px 40px -10px rgba(0,0,0,0.08)',
      }
    }
  },
  plugins:[],
}