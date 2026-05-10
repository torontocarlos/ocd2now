import { describe, it, expect } from "vitest";
import { listFragments, getFragment } from "./fragments";

describe("fragment registry", () => {
  it("exposes invitations + still-text + silence + redirect-out kinds", () => {
    const all = listFragments();
    const byKind = {
      invitation: all.filter((f) => f.kind === "invitation"),
      stillText: all.filter((f) => f.kind === "still-text"),
      silence: all.filter((f) => f.kind === "silence"),
      redirectOut: all.filter((f) => f.kind === "redirect-out"),
    };
    expect(byKind.invitation).toHaveLength(8);
    expect(byKind.stillText.length).toBeGreaterThanOrEqual(4);
    expect(byKind.silence.length).toBeGreaterThanOrEqual(1);
    expect(byKind.redirectOut.length).toBeGreaterThanOrEqual(1);
  });

  it("invitation ids 1..8 match the DB seed exactly", () => {
    const ids = listFragments()
      .filter((f) => f.kind === "invitation")
      .map((f) => f.id)
      .sort((a, b) => a - b);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("non-invitation fragment ids are 100+ so they don't collide with invitation ids", () => {
    const nonInv = listFragments().filter((f) => f.kind !== "invitation");
    nonInv.forEach((f) => expect(f.id).toBeGreaterThanOrEqual(100));
  });

  it("each kind uses its own id range (still-text 100s, silence 200s, redirect-out 300s)", () => {
    const all = listFragments();
    all.forEach((f) => {
      if (f.kind === "still-text") {
        expect(f.id).toBeGreaterThanOrEqual(100);
        expect(f.id).toBeLessThan(200);
      } else if (f.kind === "silence") {
        expect(f.id).toBeGreaterThanOrEqual(200);
        expect(f.id).toBeLessThan(300);
      } else if (f.kind === "redirect-out") {
        expect(f.id).toBeGreaterThanOrEqual(300);
        expect(f.id).toBeLessThan(400);
      }
    });
  });

  it("getFragment returns by id and null for unknown ids", () => {
    expect(getFragment(1)?.kind).toBe("invitation");
    expect(getFragment(101)?.kind).toBe("still-text");
    expect(getFragment(201)?.kind).toBe("silence");
    expect(getFragment(301)?.kind).toBe("redirect-out");
    expect(getFragment(99999)).toBeNull();
  });
});
