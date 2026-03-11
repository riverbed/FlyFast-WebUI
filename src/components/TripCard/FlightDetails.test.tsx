import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import FlightDetails from "@/components/TripCard/FlightDetails";

vi.mock("@/components/Flight/Flight", () => ({
  default: ({ index }: { index: number }) => <div data-testid={`trip-flight-${index}`} />,
}));

describe("TripCard FlightDetails", () => {
  it("renders every segment", () => {
    render(
      <MantineProvider>
        <FlightDetails
          cart={true}
          flights={[
            {
              flightNumber: "FF1",
              airline: "FlyFast",
              departureTime: "2024-07-01T08:00:00Z",
              arrivalTime: "2024-07-01T10:00:00Z",
              from: "CHP",
              to: "VLM",
              seat: "Economy",
              fare: 50,
            },
            {
              flightNumber: "FF2",
              airline: "FlyFast",
              departureTime: "2024-07-01T11:00:00Z",
              arrivalTime: "2024-07-01T12:00:00Z",
              from: "VLM",
              to: "SIL",
              seat: "Economy",
              fare: 50,
            },
          ]}
        />
      </MantineProvider>
    );

    expect(screen.getByTestId("trip-flight-0")).toBeInTheDocument();
    expect(screen.getByTestId("trip-flight-1")).toBeInTheDocument();
  });
});
