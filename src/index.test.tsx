/**
 * Test suite for index.tsx
 * Tests application entry point initialization and React root rendering
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock dependencies BEFORE importing index.tsx to intercept side effects
const mockCreateRoot = vi.fn(() => ({
  render: vi.fn(),
}));

const mockTracing = vi.fn();
const mockReportWebVitals = vi.fn();

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.mock("@/services/Tracing", () => ({
  default: mockTracing,
}));

vi.mock("@/reportWebVitals", () => ({
  default: mockReportWebVitals,
}));

vi.mock("@/App", () => ({
  default: () => null,
}));

describe("index.tsx", () => {
  beforeEach(() => {
    // Clear the root element
    const root = document.getElementById("root");
    if (root) {
      root.remove();
    }
  });

  it("initializes application with Tracing, ReportWebVitals, and React root", async () => {
    // Create root element that index.tsx expects
    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    // Dynamically import index.tsx to trigger its module-level side effects
    // All imports it uses are already mocked
    await import("@/index");

    // Verify the initialization functions were called
    expect(mockTracing).toHaveBeenCalled();
    expect(mockReportWebVitals).toHaveBeenCalled();

    // Verify createRoot was called to initialize React rendering
    expect(mockCreateRoot).toHaveBeenCalledWith(rootDiv);

    rootDiv.remove();
  });

  it("handles DOM operations safely", () => {
    // Verify root element query methods work correctly
    let root = document.getElementById("root");
    expect(root).toBeNull();

    const rootDiv = document.createElement("div");
    rootDiv.id = "root";
    document.body.appendChild(rootDiv);

    root = document.getElementById("root");
    expect(root).toBe(rootDiv);

    rootDiv.remove();
  });
});
