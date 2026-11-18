#!/usr/bin/env python3
"""Harvest genuine webinar/event artwork from first-party public event pages.

Uses only publicly accessible Hitachi Vantara / BrightTALK source pages and
verified HTTPS image downloads. Does not claim a generated image is approved.
Corporate SharePoint sharing links intentionally are not fetched.
"""
import io
import json
import os
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from PIL import Image, UnidentifiedImageError

SOURCE = Path("content.json")
OUT = Path("news-images")
LIMIT = int(os.getenv("MAX_WEBINAR_IMAGES", "30"))
SESSION = requests.Session()
SESSION.headers["User-Agent"] = "Mozilla/5.0 (compatible; ContentLibraryPublisher/1.0)"

def hostname(url):
    try:
        p = urlparse(url)
        return p.hostname.lower() if p.scheme == "https" and p.hostname else ""
    except Exception:
        return ""

def trusted_source(url):
    h = hostname(url)
    return h in ("www.brighttalk.com", "brighttalk.com",
                 "www.hitachivantara.com", "hitachivantara.com")

def trusted_image(url):
    h = hostname(url)
    return bool(h and (
        h == "hitachivantara.com" or h.endswith(".hitachivantara.com")
        or h == "brighttalk.com" or h.endswith(".brighttalk.com")
        or h == "akamaihd.net" or h.endswith(".akamaihd.net")
        or h == "cloudinary.com" or h.endswith(".cloudinary.com")
    ))

def public_html(url):
    if not trusted_source(url):
        return None
    try:
        res = SESSION.get(url, timeout=17)
        res.raise_for_status()
        if not trusted_source(res.url) or "html" not in res.headers.get("content-type", ""):
            return None
        return res.text[:1_500_000]
    except requests.RequestException:
        return None

def image_candidates(doc, base):
    soup = BeautifulSoup(doc, "html.parser")
    result = []
    for key, val in [("property","og:image"), ("name","twitter:image"), ("property","og:image:url")]:
        for tag in soup.select("meta["+key+"]"):
            if (tag.get(key) or "").lower() == val:
                url = urljoin(base, tag.get("content", ""))
                if trusted_image(url) and url not in result:
                    result.append(url)
    return result

def source_urls(item):
    urls = []
    source = item.get("url", "")
    if trusted_source(source):
        urls.append(source)
    # Official branded event pages can expose campaign artwork even if the
    # Content Library lists only the BrightTALK session URL.
    if str(item.get("type","")).lower() == "webinar":
        slug = re.sub(r"[^a-z0-9]+", "-", (item.get("title","").split("|")[0]).lower()).strip("-")
        if slug:
            urls.append("https://www.hitachivantara.com/en-us/company/events-and-webinars/" + slug)
    return list(dict.fromkeys(urls))

def fetch_image(url, page_url):
    if not trusted_image(url):
        return None
    try:
        with SESSION.get(url, timeout=22, stream=True) as res:
            res.raise_for_status()
            if not trusted_image(res.url) or not res.headers.get("content-type","").startswith("image/"):
                return None
            buf=io.BytesIO()
            for chunk in res.iter_content(65536):
                buf.write(chunk)
                if buf.tell() > 7_000_000:
                    return None
        im=Image.open(io.BytesIO(buf.getvalue()))
        if im.width < 400 or im.height < 220:
            return None
        # Preserve true source artwork; convert to compact public preview.
        if getattr(im,"is_animated",False):
            im.seek(0)
        rgb=im.convert("RGB")
        rgb.thumbnail((1200,850))
        return rgb
    except (requests.RequestException, OSError, UnidentifiedImageError, ValueError):
        return None

def main():
    if not SOURCE.exists():
        raise SystemExit("Missing content.json")
    OUT.mkdir(exist_ok=True)
    items=json.loads(SOURCE.read_text(encoding="utf-8")).get("items",[])
    created=0
    checked=0
    for item in reversed(items):
        if created >= LIMIT:
            break
        item_id=item.get("id","")
        if not item_id or "/" in item_id or "\\" in item_id:
            continue
        dest=OUT/(item_id+".webp")
        if dest.exists() or str(item.get("type","")).lower() not in ("webinar","event","virtual event"):
            continue
        checked+=1
        for page in source_urls(item):
            doc=public_html(page)
            if not doc:
                continue
            for u in image_candidates(doc,page):
                im=fetch_image(u,page)
                if im is None:
                    continue
                im.save(dest,"WEBP",quality=82,method=5)
                print("Created", dest, "from", page)
                created+=1
                break
            if dest.exists():
                break
        if not dest.exists():
            print("No downloadable public artwork:", item_id)
    print(f"New webinar images: {created}; webinar assets attempted: {checked}")

if __name__ == "__main__":
    main()
