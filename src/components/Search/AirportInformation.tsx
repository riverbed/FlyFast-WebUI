import { forwardRef } from "react";
import { Group, Text, type ComboboxItem, type OptionsFilter } from "@mantine/core";

export interface AirportItem {
  name: string;
  city: string;
  country: string;
  value: string;
  label: string;
}

export const AirportInformation = forwardRef<HTMLDivElement, AirportItem>(
  ({ name, city, country, value, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group wrap="nowrap">
        <div>
          <Text>
            {name} ({value})
          </Text>
          <Text size="sm" c="dimmed">
            {city}, {country}
          </Text>
        </div>
      </Group>
    </div>
  )
);

const normalizeSearch = (input: string) => input.toLowerCase().replace(/\s/g, "");

export const airportFilter: OptionsFilter = ({ options, search }) => {
  const normalized = normalizeSearch(search);
  const normalizedOptions = (options as Array<AirportItem | ComboboxItem>).map((item) => {
    const airport = item as AirportItem;
    return { ...airport, label: airport.label ?? airport.name };
  });

  return normalizedOptions.filter((airport) => {
    return (
      normalizeSearch(airport.name).includes(normalized) ||
      normalizeSearch(airport.city).includes(normalized) ||
      normalizeSearch(airport.country).includes(normalized) ||
      normalizeSearch(airport.value).includes(normalized)
    );
  });
};

export const airportBackendFilter: OptionsFilter = ({ options }) => options;
