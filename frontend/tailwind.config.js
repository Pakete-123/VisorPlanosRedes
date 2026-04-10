/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        "custom-blue": "#1A5FA8",
        "custom-teal": "#0F6E56",
        "custom-dark": "#1C1C2E",
      },
    },
  },
  plugins: [],
};
