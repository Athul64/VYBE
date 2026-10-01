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
        marker: ["Kalam", "cursive"],      // Headings (wght 700)
        hand: ["Patrick Hand", "cursive"], // Body text & labels (wght 400)
      },
      boxShadow: {
        sketch: "4px 4px 0px 0px #2d2d2d",
        sketchLg: "8px 8px 0px 0px #2d2d2d",
        sketchHover: "2px 2px 0px 0px #2d2d2d",
      },
      borderRadius: {
        wobbly: "255px 15px 225px 15px / 15px 225px 15px 255px",
        wobblyMd: "20px 255px 20px 255px / 255px 20px 255px 20px",
        wobblyPill: "255px 25px 225px 25px / 25px 225px 25px 255px",
      },
    },
  },
  plugins: [],
};
