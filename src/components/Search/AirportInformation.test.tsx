import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import {
  AirportInformation,
  airportBackendFilter,
  airportFilter,
  type AirportItem,
} from "@/components/Search/AirportInformation";

describe("AirportInformation", () => {
  const options: AirportItem[] = [
    {
      name: "CHP Airport",
      city: "Aquamarine",
      country: "Java Kotlin Empire",
      value: "CHP",
      label: "CHP",
    },
    {
      name: "SIL Airport",
      city: "Ruby",
      country: "Swift Empire",
      value: "SIL",
      label: "SIL",
    },
  ];

  it("renders airport display content", () => {
    render(
      <MantineProvider>
        <AirportInformation
          name="CHP Airport"
          city="Aquamarine"
          country="Java Kotlin Empire"
          value="CHP"
          label="CHP"
        />
      </MantineProvider>
    );

    expect(screen.getByText("CHP Airport (CHP)")).toBeInTheDocument();
    expect(screen.getByText("Aquamarine, Java Kotlin Empire")).toBeInTheDocument();
  });

  it("filters airports by normalized search text", () => {
    const filteredByCity = airportFilter({
      options,
      search: "aqua marine",
      limit: 10,
    });

    const filteredByCode = airportFilter({
      options,
      search: "sil",
      limit: 10,
    });

    expect(filteredByCity).toHaveLength(1);
    expect((filteredByCity[0] as AirportItem).value).toBe("CHP");
    expect(filteredByCode).toHaveLength(1);
    expect((filteredByCode[0] as AirportItem).value).toBe("SIL");
  });

  it("falls back to airport name when label is missing", () => {
    const filtered = airportFilter({
      options: [
        {
          name: "Vista Airport",
          city: "Vista",
          country: "Cloud Nation",
          value: "VST",
        } as AirportItem,
      ],
      search: "vista",
      limit: 10,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toMatchObject({ label: "Vista Airport", value: "VST" });
  });

  it("returns raw options for backend filter", () => {
    const result = airportBackendFilter({ options, search: "any", limit: 10 });
    expect(result).toBe(options);
  });
});
