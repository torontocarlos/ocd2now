import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Apple home-screen icon. iOS uses this when a user adds the PWA to
// their home screen and also (via apple-touch-icon link) when iMessage
// renders a rich link preview for a URL. 180×180 is the modern default.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function loadCormorantItalic() {
  const path = join(process.cwd(), "app", "fonts", "CormorantGaramond-Italic.ttf");
  return readFile(path);
}

export default async function AppleIcon() {
  const cormorant = await loadCormorantItalic();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F4F0E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Cormorant",
          fontStyle: "italic",
          fontSize: 130,
          color: "#1A1815",
          lineHeight: 1,
          // Optical adjustment — italic descender drifts low without this.
          paddingBottom: 14,
        }}
      >
        n
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant",
          data: cormorant,
          weight: 400,
          style: "italic",
        },
      ],
    },
  );
}
