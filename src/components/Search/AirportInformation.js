import { forwardRef } from 'react';
import { Group, Text } from '@mantine/core';

export const airportInformation = forwardRef(
  ({ name, city, country, value, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <div>
          <Text>{name} ({value})</Text>
          <Text size="sm" color="dimmed">
            {city}, {country}
          </Text>
        </div>
      </Group>
    </div>
  )
);

export const airportFilter = (value, item) => (
  item.name.toLowerCase().replace(/\s/g, '').includes(value.toLowerCase().replace(/\s/g, '')) ||
  item.city.toLowerCase().replace(/\s/g, '').includes(value.toLowerCase().replace(/\s/g, '')) ||
  item.country.toLowerCase().replace(/\s/g, '').includes(value.toLowerCase().replace(/\s/g, '')) ||
  item.value.toLowerCase().replace(/\s/g, '').includes(value.toLowerCase().replace(/\s/g, ''))
);

export const airportBackendFilter = (value, item) => (
  true
);