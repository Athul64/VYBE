/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: "var(--paper-bg, #fdfbf7)",       // Warm Paper background / Dark Slate
          muted: "var(--paper-muted, #e5e0d8)", // Old Paper / Erased Pencil
          yellow: "var(--paper-yellow, #fff9c4)",// Post-it Sticky Note / Golden Chalk
        },
        pencil: "var(--pencil, #2d2d2d)",       // Soft Pencil Black / Chalk White
        marker: {
          red: "var(--marker-red, #ff4d4d)",    // Red Correction Marker / Neon Coral
          blue: "var(--marker-blue, #2d5da1)",  // Blue Ballpoint Pen / Cyan Blueprint
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        marker: ["Kalam", "cursive"],      // Headings (wght 700)
        hand: ["Patrick Hand", "cursive"], // Handwritten annotations / quotes
      },
      boxShadow: {
        sketch: "3px 3px 0px 0px #2d2d2d",
        sketchLg: "5px 5px 0px 0px #2d2d2d",
        sketchHover: "2px 2px 0px 0px #2d2d2d",
      },
      borderRadius: {
        wobbly: "10px",
        wobblyMd: "14px",
        wobblyPill: "9999px",
      },
    },
  },
  plugins: [],
};
