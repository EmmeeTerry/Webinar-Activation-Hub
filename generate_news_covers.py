#!/usr/bin/env python3
"""Generate news thumbnails from public first-party PDFs when approved artwork is absent.

Only downloads public hitachivantara.com PDFs from the existing Content Library feed.
Keeps generated thumbnails separate from manually approved artwork. Failures do not block synchronization.
"""
import json
import os
from pathlib import Path
from urllib.parse import urlparse
import requests

SOURCE = Path("content.json")
OUT = Path("news-images")
MAX_PER_RUN = int(os.environ.get("MAX_COVERS_PER_RUN", "25"))
MAX_DOWNLOAD_BYTES = 18 * 1024 * 1024
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0 (compatible; HitachiVantaraContentLibrary/1.0)"})

def allowed_pdf(url):
    try:
        p = urlparse(url or "")
        return (
            p.scheme == "https"
            and p.hostname in ("www.hitachivantara.com", "hitachivantara.com")
            and p.path.lower().endswith(".pdf")
        )
    except Exception:
        return False

def main():
    import fitz  # PyMuPDF, only required by this separate cover generation step
    if not SOURCE.exists():
        raise SystemExit("No content.json")
    items = json.loads(SOURCE.read_text(encoding="utf-8")).get("items", [])
    OUT.mkdir(exist_ok=True)
    created = failures = skipped = 0
    # Prefer newest items; remaining eligible records are retried in future scheduled runs
    for item in reversed(items):
        if created >= MAX_PER_RUN:
            break
        asset_id = item.get("id", "")
        pdf = item.get("url", "")
        dest = OUT / (asset_id + ".webp")
        if not asset_id or "/" in asset_id or "\\" in asset_id or dest.exists() or not allowed_pdf(pdf):
            skipped += 1
            continue
        try:
            with SESSION.get(pdf, timeout=25, stream=True, allow_redirects=True) as res:
                res.raise_for_status()
                total = 0
                chunks = []
                for chunk in res.iter_content(131072):
                    total += len(chunk)
                    if total > MAX_DOWNLOAD_BYTES:
                        raise ValueError("PDF too large")
                    chunks.append(chunk)
                data = b"".join(chunks)
            if not data.startswith(b"%PDF"):
                raise ValueError("Not PDF bytes")
            with fitz.open(stream=data, filetype="pdf") as doc:
                if not doc.page_count:
                    raise ValueError("Empty PDF")
                pg = doc.load_page(0)
                pix = pg.get_pixmap(matrix=fitz.Matrix(1.2, 1.2), alpha=False)
                # Pillow compresses large first pages as efficient WebP thumbnails
                from PIL import Image
                from io import BytesIO
                img = Image.open(BytesIO(pix.tobytes("png")))
                img.thumbnail((860, 1100))
                img.save(dest, "WEBP", quality=78, method=5)
            created += 1
            print(f"Created {dest} ({dest.stat().st_size} bytes)")
        except Exception as exc:
            failures += 1
            print(f"SKIP {asset_id}: {exc}")
    print(f"Created {created} | failed {failures} | skipped {skipped}")

if __name__ == "__main__":
    main()
