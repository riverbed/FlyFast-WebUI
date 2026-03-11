import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import Search from "@/components/Search/Search";
import { getAirportValue, getHydratedText, getHydratedTripType } from "@/components/Search/Search";
import { airportTypeAhead } from "@/services/Flight";

const mockNavigate = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/services/Flight", () => ({
  airportTypeAhead: vi.fn(),
}));

const renderSearch = (props: Parameters<typeof Search>[0] = {}) =>
  render(
    <MantineProvider>
      <Search {...props} />
    </MantineProvider>
  );

const getInputFromTestId = (testId: string): HTMLInputElement => {
  const node = screen.getByTestId(testId);
  if (node instanceof HTMLInputElement) {
    return node;
  }

  const input = node.querySelector("input") as HTMLInputElement | null;
  if (!input) {
    throw new Error(`No input found for ${testId}`);
  }

  return input;
};

describe("Search component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(airportTypeAhead).mockResolvedValue([
      {
        code: "CHP",
        name: "CHP Airport",
        city: "Aquamarine",
        country: "Java Kotlin Empire",
      },
    ]);
  });

  it("hydrates provided values and submits a round-trip search URL", async () => {
    renderSearch({
      fromData: "CHP",
      toData: "SIL",
      seatData: "Economy",
      tripDateData: ["2024-07-01", "2024-07-07"],
    });

    await waitFor(() => {
      expect(getInputFromTestId("search-from-input").value).toBe("CHP");
      expect(getInputFromTestId("search-to-input").value).toBe("SIL");
    });

    fireEvent.submit(screen.getByTestId("search-form"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/searchflight?from=CHP&to=SIL&departure=07-01-2024&return=07-07-2024&seat=Economy"
    );
  });

  it("submits one-way search without return parameter", async () => {
    renderSearch({ fromData: "CHP", toData: "SIL", seatData: "Economy" });

    const tripSelect = screen.getByTestId("search-trip-type-select") as HTMLSelectElement;
    fireEvent.change(tripSelect, { target: { value: "One Way" } });

    fireEvent.submit(screen.getByTestId("search-form"));

    const navigateArg = mockNavigate.mock.calls[0][0] as string;
    expect(navigateArg.startsWith("/searchflight?from=CHP&to=SIL")).toBe(true);
    expect(navigateArg.includes("&return=")).toBe(false);
  });

  it("defaults the return date to one week later when only departure is provided", async () => {
    renderSearch({
      fromData: "CHP",
      toData: "SIL",
      seatData: "Economy",
      tripDateData: ["2024-07-01", null],
    });

    await waitFor(() => {
      expect(getInputFromTestId("search-from-input").value).toBe("CHP");
      expect(getInputFromTestId("search-to-input").value).toBe("SIL");
    });

    fireEvent.change(screen.getByTestId("search-trip-type-select"), {
      target: { value: "Round Trip" },
    });
    fireEvent.submit(screen.getByTestId("search-form"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/searchflight?from=CHP&to=SIL&departure=07-01-2024&return=07-08-2024&seat=Economy"
    );
  });

  it("calls backend typeahead when backend mode is enabled", async () => {
    renderSearch({ fromData: "CHP" });

    fireEvent.click(screen.getByTestId("search-toggle-typeahead-button"));

    await waitFor(() => {
      expect(airportTypeAhead).toHaveBeenCalledWith("CHP", 5);
    });
  });

  it("logs backend typeahead errors without crashing", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(airportTypeAhead).mockRejectedValue(new Error("typeahead failed"));

    renderSearch({ fromData: "CHP" });
    fireEvent.click(screen.getByTestId("search-toggle-typeahead-button"));

    await waitFor(() => {
      expect(airportTypeAhead).toHaveBeenCalledWith("CHP", 5);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  it("updates seat selection before submit", async () => {
    renderSearch({ fromData: "CHP", toData: "SIL", seatData: "Economy" });

    const seatSelect = screen.getByTestId("search-seat-type-select") as HTMLSelectElement;
    fireEvent.change(seatSelect, { target: { value: "Business" } });
    fireEvent.submit(screen.getByTestId("search-form"));

    expect(mockNavigate.mock.calls[0][0]).toContain("&seat=Business");
  });

  it("normalizes airport value with value-first and code fallback behavior", () => {
    expect(getAirportValue({ value: "SIL", code: "CHP" })).toBe("SIL");
    expect(getAirportValue({ code: "CHP" })).toBe("CHP");
    expect(getAirportValue({ code: 123 })).toBe("123");
    expect(getAirportValue({})).toBe("");
  });

  it("hydrates trip type from query date data", () => {
    expect(getHydratedTripType(["2024-07-01", "2024-07-07"])).toBe("Round Trip");
    expect(getHydratedTripType(["2024-07-01", null])).toBe("One Way");
    expect(getHydratedTripType(undefined)).toBe("One Way");
  });

  it("hydrates text fields with empty-string fallback", () => {
    expect(getHydratedText("CHP")).toBe("CHP");
    expect(getHydratedText(null)).toBe("");
    expect(getHydratedText(undefined)).toBe("");
  });
});
