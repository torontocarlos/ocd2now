import { describe, it, expect } from "vitest";
import { classifyBand } from "./frequency";

// Bands per build spec §5.2 / playbook §8:
//   < 4    → standard
//   4–6    → pause-soft
//   7–12   → pause-firm
//   13+    → threshold
// These thresholds matter therapeutically — getting them wrong means an
// OCD user in a high-frequency loop sees the standard "Begin" button
// instead of the pause/threshold screens. Lock them down.

describe("classifyBand", () => {
  it("0, 1, 2, 3 are standard", () => {
    [0, 1, 2, 3].forEach((n) => expect(classifyBand(n)).toBe("standard"));
  });

  it("4, 5, 6 are pause-soft", () => {
    [4, 5, 6].forEach((n) => expect(classifyBand(n)).toBe("pause-soft"));
  });

  it("7 through 12 are pause-firm", () => {
    [7, 8, 9, 10, 11, 12].forEach((n) =>
      expect(classifyBand(n)).toBe("pause-firm"),
    );
  });

  it("13 and above are threshold", () => {
    [13, 14, 50, 999].forEach((n) =>
      expect(classifyBand(n)).toBe("threshold"),
    );
  });

  it("boundaries are exactly where the spec says", () => {
    expect(classifyBand(3)).toBe("standard");
    expect(classifyBand(4)).toBe("pause-soft");
    expect(classifyBand(6)).toBe("pause-soft");
    expect(classifyBand(7)).toBe("pause-firm");
    expect(classifyBand(12)).toBe("pause-firm");
    expect(classifyBand(13)).toBe("threshold");
  });
});
