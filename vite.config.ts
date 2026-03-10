import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const flightSearchTarget = env.VITE_FLIGHT_SEARCH ?? "http://localhost:8080";
  const tracingTarget = env.VITE_OPENTELEMETRY_ENDPOINT ?? "http://localhost:55681";

  return {
    plugins: [react()],
    build: {
      outDir: "dist",
    },
    server: {
      proxy: {
        "/flightsearchapi": {
          target: flightSearchTarget,
          changeOrigin: true,
        },
        "/tracingapi": {
          target: tracingTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tracingapi/, ""),
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
    },
  };
});