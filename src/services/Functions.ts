type DateFormatOptions = Intl.DateTimeFormatOptions;

export const timeConversion = (
  timeFormat: string | number | Date,
  options: DateFormatOptions
): string => {
  const date = new Date(timeFormat);
  return date.toLocaleDateString(undefined, options);
};

export const timeDifference = (
  departureTime: string | number | Date,
  arrivalTime: string | number | Date
): string => {
  const departureDate = new Date(departureTime);
  const arrivalDate = new Date(arrivalTime);
  const dateDifference = Math.abs(departureDate.getTime() - arrivalDate.getTime());
  const dateHours = Math.floor((dateDifference / (1000 * 60 * 60)) % 24);
  const dateMinutes = Math.floor((dateDifference / (1000 * 60)) % 60);

  let totalTime = dateHours > 0 ? dateHours + " Hours " : " ";
  totalTime += dateMinutes > 0 ? dateMinutes + " Minutes" : "";
  return totalTime;
};

export const jsonSerialize = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("JSON Serialize Error:\n" + error);
    return "";
  }
};

export const jsonDeserialize = <T = unknown[]>(value: string): T | unknown[] => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("JSON Deserialize Error:\n" + error);
    return [];
  }
};
