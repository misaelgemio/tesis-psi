import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        // Base accesible ≥ 16px
        base: ["1rem", { lineHeight: "1.6" }],
      },
      colors: {
        marca: {
          DEFAULT: "#1e3a5f",
          claro: "#2c5282",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
