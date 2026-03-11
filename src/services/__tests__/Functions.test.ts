import {
  jsonDeserialize,
  jsonSerialize,
  timeConversion,
  timeDifference,
} from "@/services/Functions";

describe("Functions service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formats a date-like value with provided options", () => {
    const result = timeConversion("2024-07-01T08:00:00Z", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    });

    expect(result).toContain("2024");
  });

  it("returns hour and minute duration between two times", () => {
    const result = timeDifference("2024-07-01T08:00:00Z", "2024-07-01T12:30:00Z");
    expect(result).toBe("4 Hours 30 Minutes");
  });

  it("returns 0 Minutes for same departure and arrival", () => {
    const result = timeDifference("2024-07-01T08:00:00Z", "2024-07-01T08:00:00Z");
    expect(result).toBe("0 Minutes");
  });

  it("serializes plain objects to JSON", () => {
    const payload = { from: "CHP", to: "SIL", fare: 199.99 };
    const result = jsonSerialize(payload);

    expect(result).toBe('{"from":"CHP","to":"SIL","fare":199.99}');
  });

  it("returns empty string when serialization throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const result = jsonSerialize(circular);

    expect(result).toBe("");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("deserializes valid JSON values", () => {
    const payload = '[{"flightNumber":"FF123","fare":199.99}]';

    const result = jsonDeserialize<{ flightNumber: string; fare: number }[]>(payload);

    expect(result).toEqual([{ flightNumber: "FF123", fare: 199.99 }]);
  });

  it("returns empty array for invalid JSON", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = jsonDeserialize("{not-valid-json");

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
