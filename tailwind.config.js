
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}","./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary:"#4F677D",
        secondary: "#92BCEA",
        accent: "#F4F8FB",
        dark: {
          100: "2b2c28",
          200: "131515"

        }
      }
    },
  },
  plugins: [],
}