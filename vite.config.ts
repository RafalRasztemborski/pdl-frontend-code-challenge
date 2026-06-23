import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignoruj błędy związane ze źle umieszczonymi adnotacjami PURE
        if (warning.code === "INVALID_ANNOTATION") return;

        // Dla reszty ostrzeżeń użyj domyślnego zachowania
        warn(warning);
      },
    },
  },
});
