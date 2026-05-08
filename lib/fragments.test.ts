import { describe, it, expect } from "vitest";
import { listFragments, getFragment } from "./fragments";

describe("fragment registry", () => {
  it("exposes all 8 invitations + at least 4 still-text fragments", () => {
    const all = listFragments();
    const invitations = all.filter((f) => f.kind === "invitation");
    const stills = all.filter((f) => f.kind === "still-text");
    expect(invitations).toHaveLength(8);
    expect(stills.length).toBeGreaterThanOrEqual(4);
  });

  it("invitation ids 1..8 match the DB seed exactly", () => {
    const ids = listFragments()
      .filter((f) => f.kind === "invitation")
      .map((f) => f.id)
      .sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("still-text fragment ids are in the 100+ range so they don't collide with invitation ids", () => {
    const stills = listFragments().filter((f) => f.kind === "still-text");
    stills.forEach((f) => expect(f.id).toBeGreaterThanOrEqual(100));
  });

  it("getFragment returns by id and null for unknown ids", () => {
    expect(getFragment(1)?.kind).toBe("invitation");
    expect(getFragment(101)?.kind).toBe("still-text");
    expect(getFragment(99999)).toBeNull();
  });
});
