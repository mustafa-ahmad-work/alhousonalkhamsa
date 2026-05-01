/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#065f46", // Emerald 800
          DEFAULT: "#064e3b", // Emerald 900
          dark: "#022c22", // Emerald 950
        },
        gold: {
          light: "#fde68a",
          DEFAULT: "#fbbf24",
          dark: "#d97706",
        },
        cream: {
          light: "#fffbeb",
          DEFAULT: "#fef3c7",
          dark: "#fef3c7",
        },
      },
      fontFamily: {
        sans: ["Tajawal_500Medium"],
        medium: ["Tajawal_500Medium"],
        bold: ["Tajawal_700Bold"],
        quran: ["Amiri_400Regular"],
      },
    },
  },
  plugins: [],
};
