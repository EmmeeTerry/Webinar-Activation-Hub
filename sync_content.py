#!/usr/bin/env python3
"""
sync_content.py
----------------
Reads the full Content Mapping Master List sheet from Smartsheet and writes
content.json for the Content Library dashboard (content-hub.html). This is
a separate, independent pipeline from sync_webinars.py / webinars.json --
it does not touch or depend on the Webinar Activation Hub in any way.

Required environment variables:
    SMARTSHEET_API_TOKEN   Your Smartsheet API access token (same one used
                             for the webinar sync)
    CONTENT_SHEET_ID       Numeric ID of the Content Mapping Master List
                             (same one used for the webinar sync's related
                             resources -- reused here, not duplicated)

Run:
    python sync_content.py
"""
import json
import os
import re
import sys
from datetime import datetime, timezone

try:
    import smartsheet
except ImportError:
    sys.exit("Missing dependency. Run: pip install smartsheet-python-sdk")

# ---------------------------------------------------------------------------
# CONFIG -- column-title mapping, confirmed against the real sheet already
# ---------------------------------------------------------------------------

COLUMN_MAP = {
    "title":       "Asset Title",             # plain text column
    "url":         "Asset Title (with Link)", # hyperlink cell -- we want the URL
    "type":        "Type",
    "campaign":    "Campaign",
    "useCase":     "Use Case",
    "funnelStage": "Funnel Stage",
    "ownerTeam":   "Owner Team",
    "audience":    "Audience",
    "status":      "Status",
    "region":      "Region",
    "publishDate": "Publish Date",
    "partnerUse":  "Partner Use (Y/N)",
}

# Fields whose column is a hyperlink cell but where we want the visible text,
# not the link target (the URL is read separately via the "url" field above,
# from the same underlying column).
TEXT_ONLY_FIELDS = {"title"}

OUTPUT_PATH = os.environ.get("OUTPUT_PATH", "content.json")
DEBUG_COLUMNS = os.environ.get("DEBUG_COLUMNS") == "1"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(text):
    text = (text or "").lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:90] or "untitled"


def truthy(value):
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in ("true", "yes", "1", "checked")


def normalize_date(raw):
    if not raw:
        return None
    raw = str(raw)
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y-%m-%dT%H:%M:%S"):
        try:
            d = datetime.strptime(raw[:19] if fmt.endswith("S") else raw[:10], fmt)
            return d.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def pretty_date(iso_date):
    if not iso_date:
        return "TBD"
    try:
        return datetime.strptime(iso_date, "%Y-%m-%d").strftime("%b %d, %Y")
    except ValueError:
        return str(iso_date)


def extract_value(cell, text_only=False):
    if cell is None:
        return None
    if not text_only and getattr(cell, "hyperlink", None) and getattr(cell.hyperlink, "url", None):
        return cell.hyperlink.url
    if cell.display_value is not None:
        return cell.display_value
    return cell.value


def cell_lookup_by_id(row, col_id_by_title, title, text_only=False):
    """Regular Sheets (unlike Reports) reliably match cell.column_id to
    column.id, so ID-based lookup works fine here."""
    col_id = col_id_by_title.get(title)
    if col_id is None:
        return None
    for cell in row.cells:
        if cell.column_id == col_id:
            return extract_value(cell, text_only)
    return None


# ---------------------------------------------------------------------------
# Fetch + transform
# ---------------------------------------------------------------------------

def fetch_content_rows(client, sheet_id):
    sheet = client.Sheets.get_sheet(sheet_id)
    col_id_by_title = {c.title: c.id for c in sheet.columns}

    if DEBUG_COLUMNS:
        print("\n--- Columns Smartsheet returned for Content Mapping Master List ---")
        for title in col_id_by_title:
            print(f"  '{title}'")
        missing = [v for v in COLUMN_MAP.values() if v not in col_id_by_title]
        if missing:
            print(f"  ! Not found (fix COLUMN_MAP): {missing}")

    items = []
    for row in sheet.rows:
        raw = {k: cell_lookup_by_id(row, col_id_by_title, v, text_only=k in TEXT_ONLY_FIELDS)
               for k, v in COLUMN_MAP.items()}

        title = raw.get("title")
        if not title:
            # Fall back to the display text of the linked title column, in case
            # only that one was filled in for this row.
            title = cell_lookup_by_id(row, col_id_by_title, COLUMN_MAP["url"], text_only=True)
        if not title:
            continue  # skip only truly blank rows

        iso_date = normalize_date(raw.get("publishDate"))
        items.append({
            "id": slugify(title) + "-" + str(row.row_number),
            "title": title,
            "url": raw.get("url"),
            "type": raw.get("type") or "",
            "campaign": raw.get("campaign") or "",
            "useCase": raw.get("useCase") or "",
            "funnelStage": raw.get("funnelStage") or "",
            "ownerTeam": raw.get("ownerTeam") or "",
            "audience": raw.get("audience") or "",
            "status": raw.get("status") or "",
            "region": raw.get("region") or "",
            "publishDate": iso_date,
            "publishDateDisplay": pretty_date(iso_date),
            "partnerUse": truthy(raw.get("partnerUse")),
        })
    return items


def main():
    token = os.environ.get("SMARTSHEET_API_TOKEN")
    content_sheet_id = os.environ.get("CONTENT_SHEET_ID")

    missing = [n for n, v in [
        ("SMARTSHEET_API_TOKEN", token),
        ("CONTENT_SHEET_ID", content_sheet_id),
    ] if not v]
    if missing:
        sys.exit(f"Missing required environment variables: {', '.join(missing)}")

    client = smartsheet.Smartsheet(token)
    client.errors_as_exceptions(True)

    print("Fetching Content Mapping Master List...")
    items = fetch_content_rows(client, content_sheet_id)
    print(f"  {len(items)} content items fetched.")

    output = {
        "lastRefreshed": datetime.now(timezone.utc).isoformat(),
        "items": items,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"Wrote {OUTPUT_PATH} with {len(items)} content items.")


if __name__ == "__main__":
    main()
