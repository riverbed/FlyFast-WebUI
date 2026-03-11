/**
 * Purpose: This file (index.tsx) supports the src area of the FlyFast booking workflow.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";
import App from "@/App";
import reportWebVitals from "@/reportWebVitals";
import Tracing from "@/services/Tracing";

Tracing();

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

reportWebVitals();
