/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: "#fdfbf7",       // Warm Paper background
          muted: "#e5e0d8",    // Old Paper / Erased Pencil
          yellow: "#fff9c4",   // Post-it Sticky Note
        },
        pencil: "#2d2d2d",     // Soft Pencil Black (never #000)
        marker: {
          red: "#ff4d4d",      // Red Correction Marker (errors, accents, pins)
          blue: "#2d5da1",     // Blue Ballpoint Pen (secondary accents, focus)
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
