#!/usr/bin/env python3
"""Idempotent, conservative image optimization for homepage photos only.

Preserves pixel dimensions, crop, paths, photo credits and archival covers.
Never re-encodes an already optimized image: the manifest tracks its output SHA.
Requires Pillow on the CI runner. Original bytes stay recoverable from Git history.
"""
from __future__ import annotations
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

ASSETS = Path("assets")
MANIFEST = ASSETS / "image-optimization-manifest.json"
VERSION = "quality-76-method-6-v1"
BASES = ("agora_dialogo", "agora_gruppo_home", "agora_viaggio", "agora_chi_siamo")
TARGETS = [ASSETS / f"{name}{suffix}.webp" for name in BASES for suffix in ("", "-480", "-800")]
manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
old = manifest.get("files", {})
record = {}
optimized, saved, unchanged = 0, 0, 0

def sha(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()

for path in TARGETS:
    if not path.is_file():
        raise FileNotFoundError(f"Homepage responsive image is missing: {path}")
    payload = path.read_bytes()
    name = path.as_posix()
    digest = sha(payload)
    entry = old.get(name, {})
    if entry.get("output_sha256") == digest and entry.get("recipe") == VERSION:
        record[name] = entry
        unchanged += 1
        continue
    with Image.open(io.BytesIO(payload)) as source:
        source.load()
        original = source.convert("RGBA" if "A" in source.getbands() else "RGB")
        output = io.BytesIO()
        original.save(output, format="WEBP", quality=76, method=6)
        candidate = output.getvalue()
        with Image.open(io.BytesIO(candidate)) as check:
            check.load()
            if check.size != source.size:
                raise RuntimeError(f"Unexpected image size change for {name}")
            diff = ImageChops.difference(original.convert("RGB"), check.convert("RGB"))
            mean_error = sum(ImageStat.Stat(diff).mean) / 3.0
    # Avoid repeatedly recompressing WebP; skip insignificant savings or visible degradation.
    if len(candidate) <= len(payload) * .94 and mean_error <= 7.0:
        path.write_bytes(candidate)
        output_digest = sha(candidate)
        optimized += 1
        saved += len(payload) - len(candidate)
        print(f"Optimized {name}: {len(payload):,} -> {len(candidate):,} bytes; mean RGB error {mean_error:.2f}")
    else:
        output_digest = digest
        unchanged += 1
        print(f"Preserved {name}: no safe, material saving (mean error {mean_error:.2f})")
    record[name] = {"recipe": VERSION, "output_sha256": output_digest}

# A small, responsive header logo; keep the original PNG for favicon / schema.org.
source = ASSETS / "agora_icon.png"
target = ASSETS / "agora_icon-144.webp"
if not source.is_file():
    raise FileNotFoundError(str(source))
logo_sha = sha(source.read_bytes())
if not target.exists() or manifest.get("logo_source_sha256") != logo_sha:
    with Image.open(source) as im:
        output = im.convert("RGBA").resize((144, 144), Image.Resampling.LANCZOS)
        output.save(target, format="WEBP", quality=83, method=6)
    print(f"Created high-density header logo {target}: {target.stat().st_size:,} bytes")

MANIFEST.write_text(json.dumps({
    "version": VERSION, "files": record, "logo_source_sha256": logo_sha
}, indent=2, sort_keys=True) + "\n")
print(f"Photo optimization: {optimized} updated, {unchanged} retained, {saved:,} bytes saved")
