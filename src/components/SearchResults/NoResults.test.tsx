import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import NoResults from "@/components/SearchResults/NoResults";

describe("NoResults", () => {
  it("renders no-results message with route values", () => {
    render(
      <MantineProvider>
        <NoResults fromData="CHP" toData="SIL" />
      </MantineProvider>
    );

    expect(screen.getByText("There are currently no trips that goes from CHP to SIL.")).toBeInTheDocument();
    expect(screen.getByText("Please try again later.")).toBeInTheDocument();
  });
});
