"use client";

// Silence fragment: paper background, no text, no instruction, time
// passing. SessionPlayer wraps this in arrival + return phases as
// usual, so the user gets:
//
//   "You're here. Whatever brought you here is here too." (10s)
//    [paper, nothing, time passes] (35–50s)
//    "Enough for now." / "Whatever you were doing before — go do that next." (12s)
//
// For the spirals where even a still-text fragment feels like too much
// to read.

export function Silence() {
  return <div aria-hidden style={{ width: 1, height: 1 }} />;
}
