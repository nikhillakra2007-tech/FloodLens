import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@/lib/api/locations": path.resolve(__dirname, "lib/api/spatial/locations"),
      "@/lib/api/map": path.resolve(__dirname, "lib/api/spatial/map"),
      "@/lib/api/investigations": path.resolve(__dirname, "lib/api/investigation/investigations"),
      "@/lib/api/counterfactual": path.resolve(__dirname, "lib/api/investigation/counterfactual"),
      "@/lib/api/evidence": path.resolve(__dirname, "lib/api/investigation/evidence"),
      "@/lib/api/client": path.resolve(__dirname, "lib/api/core/client"),
      "@/lib/types/map": path.resolve(__dirname, "lib/types/spatial/map"),
      "@/lib/types/investigation": path.resolve(__dirname, "lib/types/investigation/investigation"),
      "@/lib/types/evidence": path.resolve(__dirname, "lib/types/analysis/evidence"),
      "@/lib/types/counterfactual": path.resolve(__dirname, "lib/types/analysis/counterfactual"),
      "@/lib/types/enums": path.resolve(__dirname, "lib/types/investigation/enums"),
      "@/lib/schemas/investigation": path.resolve(__dirname, "lib/schemas/investigation/investigation"),
      "@/lib/schemas/counterfactual": path.resolve(__dirname, "lib/schemas/analysis/counterfactual"),
      "@/lib/schemas/evidence": path.resolve(__dirname, "lib/schemas/analysis/evidence"),
      "@/lib/formatting": path.resolve(__dirname, "lib/format/formatting"),
      "@": path.resolve(__dirname, "."),
    },
  },
});
