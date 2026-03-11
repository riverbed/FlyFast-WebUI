/**
 * Purpose: This file (Functions.ts) supports the services area of the FlyFast booking workflow.
 */
type DateFormatOptions = Intl.DateTimeFormatOptions;

// Formats a date-like value into a localized, human-readable string.
export const timeConversion = (
  timeFormat: string | number | Date,
  options: DateFormatOptions
): string => {
  const date = new Date(timeFormat);
  return date.toLocaleDateString(undefined, options);
};

// Returns elapsed time between two dates as hours/minutes for trip summaries.
export const timeDifference = (
  departureTime: string | number | Date,
  arrivalTime: string | number | Date
): string => {
  const departureDate = new Date(departureTime);
  const arrivalDate = new Date(arrivalTime);
  const dateDifference = Math.abs(departureDate.getTime() - arrivalDate.getTime());
  const dateHours = Math.floor((dateDifference / (1000 * 60 * 60)) % 24);
  const dateMinutes = Math.floor((dateDifference / (1000 * 60)) % 60);

  const durationParts: string[] = [];
  if (dateHours > 0) {
    durationParts.push(`${dateHours} Hours`);
  }
  if (dateMinutes > 0) {
    durationParts.push(`${dateMinutes} Minutes`);
  }

  return durationParts.length > 0 ? durationParts.join(" ") : "0 Minutes";
};

// Serializes values for localStorage while preventing runtime crashes.
export const jsonSerialize = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("JSON Serialize Error:\n" + error);
    return "";
  }
};

// Parses persisted JSON and falls back to an empty array if parsing fails.
export const jsonDeserialize = <T = unknown[]>(value: string): T | unknown[] => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("JSON Deserialize Error:\n" + error);
    return [];
  }
};
