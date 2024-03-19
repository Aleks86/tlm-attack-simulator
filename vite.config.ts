import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let base = "/";
  if (mode === "production") {
    base = "/tlm-attack-simulator/";
  }
  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
