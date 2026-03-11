import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import Home from "@/pages/Home/Home";

vi.mock("@/components/Search/Search", () => ({
  default: () => <div data-testid="home-search" />,
}));

describe("Home", () => {
  it("renders search section", () => {
    render(
      <MantineProvider>
        <Home />
      </MantineProvider>
    );

    expect(screen.getByTestId("home-search")).toBeInTheDocument();
  });
});
