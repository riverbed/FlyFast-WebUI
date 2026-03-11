import { fireEvent, render, screen } from "@testing-library/react";

const mockSetColorScheme = vi.fn();
let mockComputedColorScheme: "light" | "dark" = "light";

vi.mock("@mantine/core", async () => {
  const actual = await vi.importActual<typeof import("@mantine/core")>("@mantine/core");

  return {
    ...actual,
    useComputedColorScheme: () => mockComputedColorScheme,
    useMantineColorScheme: () => ({ setColorScheme: mockSetColorScheme }),
  };
});

let hotkeyBindings: Array<[string, () => void]> = [];

vi.mock("@mantine/hooks", async () => {
  const actual = await vi.importActual<typeof import("@mantine/hooks")>("@mantine/hooks");

  return {
    ...actual,
    useHotkeys: (bindings: Array<[string, () => void]>) => {
      hotkeyBindings = bindings;
    },
  };
});

import ApplicationContainer from "@/components/ApplicationContainer/ApplicationContainer";

vi.mock("@/components/ApplicationContainer/ApplicationHeader", () => ({
  default: ({ toggleTheme, colorScheme }: { toggleTheme: () => void; colorScheme: "light" | "dark" }) => (
    <div>
      <div data-testid="app-header">{colorScheme}</div>
      <button data-testid="app-header-toggle" onClick={toggleTheme} type="button">
        toggle
      </button>
    </div>
  ),
}));

describe("ApplicationContainer", () => {
  beforeEach(() => {
    mockSetColorScheme.mockReset();
    mockComputedColorScheme = "light";
    hotkeyBindings = [];
  });

  it("renders app shell with header and children", () => {
    render(
      <ApplicationContainer>
        <div data-testid="app-child" />
      </ApplicationContainer>
    );

    expect(screen.getByTestId("app-header")).toBeInTheDocument();
    expect(screen.getByTestId("app-child")).toBeInTheDocument();
  });

  it("toggles from light mode to dark mode", () => {
    mockComputedColorScheme = "light";

    render(
      <ApplicationContainer>
        <div />
      </ApplicationContainer>
    );

    fireEvent.click(screen.getByTestId("app-header-toggle"));
    expect(mockSetColorScheme).toHaveBeenCalledWith("dark");
  });

  it("toggles from dark mode to light mode and wires hotkey handler", () => {
    mockComputedColorScheme = "dark";

    render(
      <ApplicationContainer>
        <div />
      </ApplicationContainer>
    );

    expect(screen.getByTestId("app-header")).toHaveTextContent("dark");
    expect(hotkeyBindings[0]?.[0]).toBe("mod+J");

    hotkeyBindings[0][1]();
    expect(mockSetColorScheme).toHaveBeenCalledWith("light");
  });
});
