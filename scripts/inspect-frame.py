#!/usr/bin/env python3
"""Programmatic frame inspection: decode PNG (zlib), sample regions, report stats."""
import struct
import sys
import zlib


def read_png(path):
    with open(path, "rb") as f:
        data = f.read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    pos = 8
    idat = b""
    w = h = None
    bit_depth = color_type = None
    plte = None
    while pos < len(data):
        ln = struct.unpack(">I", data[pos:pos + 4])[0]
        typ = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + ln]
        if typ == b"IHDR":
            w, h, bit_depth, color_type = struct.unpack(">IIBB", chunk[:10])
        elif typ == b"PLTE":
            plte = chunk
        elif typ == b"IDAT":
            idat += chunk
        pos += 12 + ln
    raw = zlib.decompress(idat)
    ch = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
    bpp = ch * (bit_depth // 8)
    stride = w * bpp
    px = bytearray(w * h * bpp)
    prev = bytearray(stride)
    ppos = 0
    for y in range(h):
        filt = raw[ppos]
        ppos += 1
        line = bytearray(raw[ppos:ppos + stride])
        ppos += stride
        if filt == 1:
            for i in range(bpp, stride):
                line[i] = (line[i] + line[i - bpp]) & 0xFF
        elif filt == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif filt == 3:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif filt == 4:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i - bpp] if i >= bpp else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        px[y * stride:(y + 1) * stride] = line
        prev = line
    return w, h, ch, bit_depth, color_type, plte, bytes(px)


def px_at(img, x, y):
    w, h, ch, bd, ct, plte, px = img
    i = (y * w + x) * ch
    if ct == 3:
        idx = px[i] * 3
        return tuple(plte[idx:idx + 3])
    return tuple(px[i:i + 3])


def region_stats(img, x0, y0, x1, y1, step=7):
    w, h, ch, bd, ct, plte, px = img
    sr = sg = sb = n = 0
    bright = 0
    rose = cer = 0
    for y in range(y0, y1, step):
        for x in range(x0, x1, step):
            r, g, b = px_at(img, x, y)
            sr += r; sg += g; sb += b; n += 1
            lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
            if lum > 90:
                bright += 1
            if r > 170 and g < 110 and b > 90:
                rose += 1
            if b > 130 and g > 90 and r < 110:
                cer += 1
    return {
        "avg": (sr // n, sg // n, sb // n),
        "bright%": round(100 * bright / n, 1),
        "rose_px": rose,
        "cerulean_px": cer,
    }


if __name__ == "__main__":
    for path in sys.argv[1:]:
        img = read_png(path)
        w, h = img[0], img[1]
        print(f"\n== {path} {w}x{h} ==")
        print(" center:", region_stats(img, w//2-300, h//2-200, w//2+300, h//2+200))
        print(" topL  :", region_stats(img, 60, 60, 660, 360))
        print(" bot   :", region_stats(img, 60, h-260, w-60, h-40))
        print(" left-mid:", region_stats(img, 60, 380, 700, 760))
        print(" right-mid:", region_stats(img, w-700, 380, w-60, 760))
