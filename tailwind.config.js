
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}","./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: "#00D9FF",       // neon cyan-mavi (ana vurgu)
  primaryGlow: "#00D9FF80", // glow/shadow için alpha versiyonu
  secondary: "#0A84FF",     // daha doygun mavi (buton/link)
  accent: "#d3f1f2",
  
  dark: {
    100: "#1A1F36", // Koyu lacivert/gri karışımı (kartlar için)
    200: "#0F1322", // Çok derin, siyaha yakın gece mavisi (arkaplan)
  },
      }
    },
  },
  plugins: [],
}