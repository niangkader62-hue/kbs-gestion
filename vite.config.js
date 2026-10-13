import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Date de la version publiee, affichee dans Menu -> Mise a jour.
  define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
});
