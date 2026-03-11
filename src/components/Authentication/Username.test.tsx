import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Username from "@/components/Authentication/Username";

describe("Username", () => {
  it("reads username from query string", () => {
    render(
      <MemoryRouter initialEntries={["/?username=Captain"]}>
        <Username />
      </MemoryRouter>
    );

    const username = screen.getByText("Captain");
    expect(username).toBeInTheDocument();
    expect(username).toHaveAttribute("title", "Captain");
  });
});
