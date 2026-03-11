/**
 * Purpose: Vite and Vitest runtime configuration for local development, proxying, build output, and tests.
 */
import react from "@vitejs/plugin-react";
import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const flightSearchTarget = env.VITE_FLIGHT_SEARCH ?? "http://localhost:8080";
  const tracingTarget = env.VITE_OPENTELEMETRY_ENDPOINT ?? "http://localhost:55681";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
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
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov", "html"],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  };
});