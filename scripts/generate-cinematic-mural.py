#!/usr/bin/env python3
"""Generate a crisp, local, lightweight real-fresco crop for the Agorà opening.

Source: Raffaello Sanzio, La Scuola di Atene (public domain reproduction),
https://commons.wikimedia.org/wiki/File:Raffael_058FXD.jpg
Fetch only if the optimized local WebP is absent; no generated people or
invented photographic provenance.
"""
from pathlib import Path
from urllib.request import Request, urlopen
import io
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

SOURCE = "https://upload.wikimedia.org/wikipedia/commons/d/dc/Raffael_058FXD.jpg"
TARGET = Path("assets/cinema-raphael-detail.webp")
if TARGET.exists() and TARGET.stat().st_size > 80_000:
    print(f"Already cached: {TARGET}, {TARGET.stat().st_size:,} bytes")
else:
    req=Request(SOURCE,headers={"User-Agent":"AgoraAPSArtwork/1.0 (contact: agora.scuoladidialogosocratico@gmail.com)"})
    try:
        with urlopen(req,timeout=35) as response:
            if not response.headers.get("Content-Type","").startswith("image/"):
                raise ValueError("Unexpected content type")
            payload=response.read(11_000_001)
        if not (50_000 <= len(payload) <= 11_000_000):
            raise ValueError(f"Unexpected source size {len(payload)}")
        with Image.open(io.BytesIO(payload)) as original:
            original.load()
            if original.width < 4000 or original.height < 3000:
                raise ValueError(f"Insufficient source resolution {original.size}")
            w,h=original.size
            # Genuine center of the fresco, where Plato and Aristotle stand.
            # Retain architectural context rather than enlarging 200 px cut-outs.
            region=original.crop((round(w*.305),round(h*.29),round(w*.705),round(h*.79)))
            detail=ImageOps.fit(region.convert("RGB"),(1800,1800),method=Image.Resampling.LANCZOS)
            detail=ImageEnhance.Color(detail).enhance(.90)
            detail=ImageEnhance.Contrast(detail).enhance(1.055)
            detail=detail.filter(ImageFilter.UnsharpMask(radius=1.0,percent=85,threshold=3))
            TARGET.parent.mkdir(parents=True,exist_ok=True)
            detail.save(TARGET,format="WEBP",quality=89,method=6)
        if TARGET.stat().st_size < 80_000:
            raise ValueError("Output asset suspiciously small")
        print(f"Generated authentic Raphael crop: {TARGET}, 1800 × 1800, {TARGET.stat().st_size:,} bytes")
    except Exception as exc:
        print(f"WARNING: source unavailable, markup retains Wikimedia high-definition fallback: {exc}")
