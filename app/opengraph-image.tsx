import { ImageResponse } from "next/og";

// Open Graph share image. This is what Messenger / iMessage / WhatsApp /
// Slack / Twitter render when someone pastes the URL. 1200×630 is the
// canonical size and survives every platform's crop.
//
// Discretion: the image says "Now," not "OCD2Now," so a recipient seeing
// a link preview in a thread isn't outed. The page <title> still reads
// "OCD2Now" for honest browser-tab identity; this asset is the gentler
// public face.

export const alt = "Now — From the loop, back to here.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F4F0E8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          padding: 80,
          position: "relative",
        }}
      >
        <div
          style={{
            fontStyle: "italic",
            fontSize: 220,
            fontWeight: 400,
            color: "#1A1815",
            lineHeight: 1,
            marginBottom: 28,
          }}
        >
          Now
        </div>
        <div
          style={{
            fontStyle: "italic",
            fontSize: 44,
            color: "#6B6358",
            lineHeight: 1.3,
          }}
        >
          From the loop, back to here.
        </div>
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: 48,
            fontSize: 22,
            color: "#6B6358",
          }}
        >
          presencetherapy.ca
        </div>
      </div>
    ),
    size,
  );
}
