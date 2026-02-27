import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/shiny-fiesta/",

  plugins: [tailwindcss()],
});
