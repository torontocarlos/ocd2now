#!/usr/bin/env python3
"""Generate solid paper-color placeholder PWA icons.

Replace the output files (public/icon-192.png, public/icon-512.png) with
real assets before public launch — these placeholders are what a user sees
on their home screen after PWA install. See README §"Replace the
placeholder icons".
"""

import struct
import zlib
from pathlib import Path


def make_png(size: int, color: tuple[int, int, int]) -> bytes:
    raw = bytearray()
    for _ in range(size):
        raw.append(0)  # filter byte per row
        for _ in range(size):
            raw.extend(color)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    idat = zlib.compress(bytes(raw))
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


def main() -> None:
    paper = (0xF4, 0xF0, 0xE8)
    public = Path(__file__).resolve().parent.parent / "public"
    public.mkdir(exist_ok=True)
    (public / "icon-192.png").write_bytes(make_png(192, paper))
    (public / "icon-512.png").write_bytes(make_png(512, paper))
    print(f"Wrote {public / 'icon-192.png'}")
    print(f"Wrote {public / 'icon-512.png'}")


if __name__ == "__main__":
    main()
