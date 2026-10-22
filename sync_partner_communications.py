#!/usr/bin/env python3
"""Generate PAM partner-communication email templates from owner-confirmed Smartsheet rows.

Required GitHub Actions secret: SMARTSHEET_API_TOKEN.\nRequired GitHub Actions variable: PARTNER_COMMUNICATIONS_SHEET_ID (numeric API sheet ID).
This script does not send messages, modify Smartsheet, or publish unconfirmed submissions.
The generated JSON is separate from the manually maintained PAM repository.
"""
import json
import os
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SHEET_ID = os.environ.get("PARTNER_COMMUNICATIONS_SHEET_ID", "").strip()
TOKEN = os.environ.get("SMARTSHEET_API_TOKEN", "").strip()
OUTPUT = Path("pam-partner-submissions.json")
VALID_TYPES = {"Partner Webinar", "Training", "Program Update", "Incentive", "Event", "Announcement", "Other"}

def clean(value, limit=2000):
    return re.sub(r"\s+", " ", str(value or "")).strip()[:limit]

def confirmed(value):
    return value is True or clean(value).lower() in {"yes", "true", "checked", "1"}

def valid_url(value):
    return bool(re.match(r"^https://[^\s/]+(?:/[^\s]*)?$", clean(value)))

def fields(sheet_row, cols):
    return {cols.get(str(c.get("columnId")), ""): (c.get("displayValue") or c.get("value") or "") for c in sheet_row.get("cells", [])}

def create_email(row):
    title = clean(row.get("Title"), 180)
    kind = clean(row.get("Communication Type"), 70)
    url = clean(row.get("Resource URL"), 1500)
    owner_raw = row.get("Owner Email")\n    owner = clean(owner_raw.get("email") if isinstance(owner_raw, dict) else owner_raw, 120)
    status = clean(row.get("Processing Status"), 50).lower()
    if status != "ready to publish" or not confirmed(row.get("Owner Confirmation")):
        return None
    if not title or kind not in VALID_TYPES or not valid_url(url) or not owner or "@" not in owner:
        return None
    summary = clean(row.get("Description / Summary"), 650)
    benefits = clean(row.get("Why This Matters to Partners"), 550)
    takeaways = clean(row.get("Key Takeaways"), 650)
    if not summary or not benefits:
        return None
    access = clean(row.get("Partner-Only Access")).lower() in {"yes", "true", "1", "checked"}
    cta = clean(row.get("Call to Action"), 90) or ("Watch on demand" if kind == "Partner Webinar" else "Learn more")
    copy = clean(row.get("Suggested Email Copy"), 2500)
    if copy:
        body = copy
        if url not in body:
            body += "\n\n" + cta + ": " + url
    else:
        body = ("Hi [First Name],\n\n"
                "I wanted to share this " + kind.lower() + " from Hitachi Vantara: " + title + ".\n\n"
                + summary + "\n\n" + benefits + "\n\n"
                + (("Key takeaways: " + takeaways + "\n\n") if takeaways else "")
                + cta + ": " + url + "\n\n"
                + ("This resource requires partner access.\n\n" if access else "")
                + "Let me know if you'd like to discuss how this could support your customers and opportunities.\n\n"
                "Best,\n[Your Name]\nPartner Account Manager | Hitachi Vantara")
    ref = clean(row.get("Submission ID"), 90) or clean(row.get("_row_id"), 90)
    slug = re.sub(r"[^a-z0-9]+", "-", ref.lower()).strip("-")
    return dict(id="partner-submission-"+slug, category="Partner Webinars" if kind == "Partner Webinar" else "Partner Communications",
                title=title, subject=title + " | Hitachi Vantara Partner Update", body=body,
                objective="Campaign promotion", region=clean(row.get("Region"), 60) or "Global",
                status="Owner-confirmed", audience="Partner-only" if access else "Partners",
                sourceUrl=url)

def main():
    if not TOKEN or not SHEET_ID:
        raise SystemExit("Configure SMARTSHEET_API_TOKEN and PARTNER_COMMUNICATIONS_SHEET_ID first.")
    req = urllib.request.Request(
        "https://api.smartsheet.com/2.0/sheets/"+SHEET_ID,
        headers={"Authorization": "Bearer "+TOKEN, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=35) as response:
        sheet=json.load(response)
    cols={str(c["id"]):c["title"] for c in sheet.get("columns", [])}
    by_id={}
    for row in sheet.get("rows", []):
        values=fields(row, cols)
        values["_row_id"]=str(row["id"])
        email=create_email(values)
        if email:
            by_id[email["id"]]=email
    OUTPUT.write_text(json.dumps({"version":"1.0","updated":datetime.now(timezone.utc).isoformat(),
        "emails":list(by_id.values())}, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print("Prepared",len(by_id),"owner-confirmed partner templates.")

if __name__ == "__main__":
    main()
