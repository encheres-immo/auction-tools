import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateDigressivePrice } from "../src/hooks/useDigressivePrice.js";

describe("calculateDigressivePrice", () => {
  test("returns starting price when no time has elapsed", () => {
    const startDate = 1000000;
    const now = 1000000; // Same as start
    const result = calculateDigressivePrice(
      startDate,
      500000, // startingPrice
      5000, // step
      60, // stepIntervalSeconds
      now
    );

    expect(result.price).toBe(500000);
    expect(result.secondsToNextStep).toBe(60);
  });

  test("decreases price by one step after stepIntervalSeconds", () => {
    const startDate = 1000000;
    const now = startDate + 60 * 1000; // 60 seconds later (1 step passed)
    const result = calculateDigressivePrice(
      startDate,
      500000,
      5000,
      60,
      now
    );

    expect(result.price).toBe(495000); // 500000 - 5000
    expect(result.secondsToNextStep).toBe(60);
  });

  test("decreases price by multiple steps over time", () => {
    const startDate = 1000000;
    const now = startDate + 180 * 1000; // 180 seconds = 3 steps
    const result = calculateDigressivePrice(
      startDate,
      500000,
      5000,
      60,
      now
    );

    expect(result.price).toBe(485000); // 500000 - (3 * 5000)
  });

  test("calculates correct seconds to next step mid-interval", () => {
    const startDate = 1000000;
    const now = startDate + 45 * 1000; // 45 seconds in (15 seconds until next step)
    const result = calculateDigressivePrice(
      startDate,
      500000,
      5000,
      60,
      now
    );

    expect(result.price).toBe(500000); // Still at starting price (no full step passed)
    expect(result.secondsToNextStep).toBe(15);
  });

  test("never returns negative price", () => {
    const startDate = 1000000;
    const now = startDate + 10000 * 1000; // Very long time passed
    const result = calculateDigressivePrice(
      startDate,
      500000,
      5000,
      60,
      now
    );

    expect(result.price).toBe(0);
    expect(result.price).toBeGreaterThanOrEqual(0);
  });

  test("handles fractional seconds correctly", () => {
    const startDate = 1000000;
    const now = startDate + 59.5 * 1000; // 59.5 seconds
    const result = calculateDigressivePrice(
      startDate,
      500000,
      5000,
      60,
      now
    );

    expect(result.price).toBe(500000); // No full step yet
    expect(result.secondsToNextStep).toBe(1); // Ceiling of 0.5
  });

  test("price decreases correctly with different step intervals", () => {
    const startDate = 1000000;
    const now = startDate + 90 * 1000; // 90 seconds

    // With 30-second intervals: 3 steps passed
    const result30s = calculateDigressivePrice(startDate, 500000, 5000, 30, now);
    expect(result30s.price).toBe(485000); // 500000 - (3 * 5000)

    // With 60-second intervals: 1 step passed
    const result60s = calculateDigressivePrice(startDate, 500000, 5000, 60, now);
    expect(result60s.price).toBe(495000); // 500000 - (1 * 5000)
  });

  test("handles start date in the future (negative elapsed time)", () => {
    const startDate = 2000000;
    const now = 1000000; // Before start date
    const result = calculateDigressivePrice(
      startDate,
      500000,
      5000,
      60,
      now
    );

    expect(result.price).toBe(500000); // No decrease
    expect(result.secondsToNextStep).toBe(60);
  });
});
