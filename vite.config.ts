/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri espera un puerto fijo y no usa polling por defecto.
export default defineConfig({
  // En GitHub Pages el sitio vive en /tesis-psi/. En dev/escritorio queda en /.
  base: process.env.GH_PAGES ? "/tesis-psi/" : "/",
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5188,
    strictPort: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
