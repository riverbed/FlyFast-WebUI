import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router";

import ApplicationHeader from "@/components/ApplicationContainer/ApplicationHeader";

vi.mock("@/components/Authentication/Username", () => ({
  default: () => <div data-testid="header-username" />,
}));

describe("ApplicationHeader", () => {
  it("renders navigation and calls theme toggle", () => {
    const toggleTheme = vi.fn();

    render(
      <MantineProvider>
        <MemoryRouter>
          <ApplicationHeader toggleTheme={toggleTheme} colorScheme="light" />
        </MemoryRouter>
      </MantineProvider>
    );

    expect(screen.getByTestId("header-home-link")).toBeInTheDocument();
    expect(screen.getByTestId("header-checkout-link")).toBeInTheDocument();
    expect(screen.getByTestId("header-username")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("header-toggle-theme-button"));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("renders dark mode variant", () => {
    render(
      <MantineProvider>
        <MemoryRouter>
          <ApplicationHeader toggleTheme={vi.fn()} colorScheme="dark" />
        </MemoryRouter>
      </MantineProvider>
    );

    expect(screen.getByTestId("header-toggle-theme-button").querySelector("svg")).not.toBeNull();
  });
});
