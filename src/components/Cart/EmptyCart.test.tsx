import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import EmptyCart from "@/components/Cart/EmptyCart";

describe("EmptyCart", () => {
  it("renders empty cart message", () => {
    render(
      <MantineProvider>
        <EmptyCart />
      </MantineProvider>
    );

    expect(screen.getByText("No flights has been added to the cart.")).toBeInTheDocument();
  });
});
