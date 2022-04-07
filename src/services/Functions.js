export const timeConversion = (timeFormat, options) => {
  const date = new Date(timeFormat);
  const formattedTime = date.toLocaleDateString(undefined, options);
  return formattedTime;
}

export const timeDifference = (departureTime, arrivalTime) => {
  const departureDate = new Date(departureTime);
  const arrivalDate = new Date(arrivalTime);
  const dateDifference = Math.abs(departureDate - arrivalDate);
  const dateHours = Math.floor((dateDifference / (1000 * 60 * 60)) % 24);
  const dateMinutes = Math.floor((dateDifference / (1000 * 60)) % 60);
  let totalTime = dateHours > 0 ? dateHours + " Hours " : " ";
  totalTime += dateMinutes > 0 ? dateMinutes + " Minutes" : "";
  return totalTime;
}

export const jsonSerialize = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('JSON Serialize Error:\n' + error);
    return '';
  }
}

export const jsonDeserialize = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('JSON Deserialize Error:\n' + error);
    return [];
  }
}