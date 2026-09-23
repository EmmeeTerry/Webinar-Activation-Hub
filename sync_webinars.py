#!/usr/bin/env python3
"""
sync_webinars.py
----------------
Reads the live Webinar Calendar report and the Content Mapping Master
List sheet from Smartsheet, transforms them into the exact data schema
the Webinar Activation Hub expects, and writes webinars.json. Optionally
uploads that file to your web host over SFTP so the live page picks it up
on its next load (the HTML already fetches ./webinars.json automatically).

WHAT YOU MUST CONFIRM BEFORE THIS WORKS AGAINST YOUR REAL DATA
---------------------------------------------------------------
I have not seen your actual Smartsheet column headers. The COLUMN_MAP
below is my best guess based on the field names in your approved HTML's
embedded sample data. Open your Webinar Calendar report and your Content
Mapping Master List sheet, compare their real column headers to the
right-hand values below, and fix any that don't match. Run with
DEBUG_COLUMNS=1 to print every column title the API actually sees, which
makes this a five-minute fix rather than guesswork.

Required environment variables:
    SMARTSHEET_API_TOKEN   Your Smartsheet API access token
    WEBINAR_REPORT_ID      Numeric ID of the Webinar Calendar report
    CONTENT_SHEET_ID       Numeric ID of the Content Mapping Master List

Optional environment variables (for the SFTP push):
    SFTP_HOST, SFTP_USER, SFTP_PASSWORD (or SFTP_KEY_PATH), SFTP_REMOTE_PATH
    If these are unset, the script just writes webinars.json locally and
    skips the upload step -- useful for testing before you wire up hosting.

Run:
    python sync_webinars.py
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
# CONFIG -- adjust these column-title mappings to match your real sheets
# ---------------------------------------------------------------------------

WEBINAR_COLUMN_MAP = {
    "title":            "Asset Title (with Link)",  # display text used; see TEXT_ONLY_FIELDS below
    "date":             "Publish Date",
    "status":           "Webinar Status",
    "campaign":         "Campaign",             # TODO: confirm this column exists on the report (see README)
    "useCase":          "Use Case",
    "audience":         "Audience",
    "region":           "Region",
    "owner":            "Owner Individual",
    "quarter":          "Fiscal Quarter",
    "partnerReady":     "Partner Use (Y/N)",     # confirmed from live column list
    "activationStatus": "Activation Status",     # TODO: confirm this column exists on the report
    "watch":            "Gated URL",
    "marketingEmail":   "Outbound Email",
    "salesEmail":       "Sales Email",
    "paidSocial":       "Paid Social",
    "social":           "Sprout Social",
    "attendance":       "Attendance Report",
}

# Fields whose Smartsheet column is a hyperlink cell, but where we want the visible
# TEXT rather than the link target (because that same column also carries the URL
# for another field, or because the field itself is meant to be plain text).
WEBINAR_TEXT_ONLY_FIELDS = {"title"}

CONTENT_COLUMN_MAP = {
    "title":    "Asset Title",            # plain text column, not the linked one
    "type":     "Type",
    "campaign": "Campaign",
    "useCase":  "Use Case",
    "url":      "Asset Title (with Link)",  # hyperlink cell -- we want the URL here
}

CONTENT_TEXT_ONLY_FIELDS = set()  # every mapped content field here should resolve to its natural value

READINESS_FROM_ACTIVATION = {
    "activation ready": "Activation ready",
    "partial":           "Partially ready",
    "not started":        "Planning",
    "not required":       "Planning",
}

OUTPUT_PATH = os.environ.get("OUTPUT_PATH", "webinars.json")
DEBUG_COLUMNS = os.environ.get("DEBUG_COLUMNS") == "1"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(text):
    text = (text or "").lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:90] or "untitled"


def extract_value(cell, text_only=False):
    """Pull the best available value out of a single cell object."""
    if cell is None:
        return None
    if not text_only and getattr(cell, "hyperlink", None) and getattr(cell.hyperlink, "url", None):
        return cell.hyperlink.url
    if cell.display_value is not None:
        return cell.display_value
    return cell.value


def cell_lookup_by_id(row, col_id_by_title, title, text_only=False):
    """Match a cell to its column via column_id. Reliable for regular Sheets."""
    col_id = col_id_by_title.get(title)
    if col_id is None:
        return None
    for cell in row.cells:
        if cell.column_id == col_id:
            return extract_value(cell, text_only)
    return None


def cell_lookup_by_position(row, index_by_title, title, text_only=False):
    """Match a cell to its column by position in the row. Needed for Reports,
    where Smartsheet's cell.column_id does not reliably match column.id."""
    idx = index_by_title.get(title)
    if idx is None or idx >= len(row.cells):
        return None
    return extract_value(row.cells[idx], text_only)


def truthy(value):
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in ("true", "yes", "1", "checked")


def pretty_date(iso_date):
    if not iso_date:
        return "TBD"
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y-%m-%dT%H:%M:%S"):
        try:
            d = datetime.strptime(iso_date[:19] if fmt.endswith("S") else iso_date[:10], fmt)
            return d.strftime("%b %d, %Y")
        except ValueError:
            continue
    return str(iso_date)


def normalize_date(raw):
    """Best-effort conversion to YYYY-MM-DD; returns None if unparseable."""
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


def why_use(audience, use_case):
    aud = (audience or "").strip().lower()
    uc = (use_case or "").strip()
    if not uc:
        return ""
    return f"Use this for {aud or 'enterprise'} conversations around {uc.lower()}."


def readiness_from(activation_status):
    key = (activation_status or "").strip().lower()
    return READINESS_FROM_ACTIVATION.get(key, "Planning")


# ---------------------------------------------------------------------------
# Fetch + transform
# ---------------------------------------------------------------------------

def fetch_report_rows(client, report_id, column_map, label, text_only_fields=frozenset()):
    report = client.Reports.get_report(report_id)
    col_id_by_title = {c.title: c.id for c in report.columns}
    index_by_title = {c.title: i for i, c in enumerate(report.columns)}

    if DEBUG_COLUMNS:
        print(f"\n--- Columns Smartsheet returned for {label} ---")
        for title in col_id_by_title:
            print(f"  '{title}'")
        missing = [v for v in column_map.values() if v not in col_id_by_title]
        if missing:
            print(f"  ! Not found (fix COLUMN_MAP): {missing}")

    rows_out = []
    for row in report.rows:
        # NOTE: Smartsheet's Reports API does not reliably match cell.column_id
        # to column.id, so we match cells to columns by position instead.
        record = {k: cell_lookup_by_position(row, index_by_title, v, text_only=k in text_only_fields)
                  for k, v in column_map.items()}
        record["_sourceRow"] = row.row_number
        rows_out.append(record)
    return rows_out


def fetch_sheet_rows(client, sheet_id, column_map, label, text_only_fields=frozenset()):
    sheet = client.Sheets.get_sheet(sheet_id)
    col_id_by_title = {c.title: c.id for c in sheet.columns}

    if DEBUG_COLUMNS:
        print(f"\n--- Columns Smartsheet returned for {label} ---")
        for title in col_id_by_title:
            print(f"  '{title}'")
        missing = [v for v in column_map.values() if v not in col_id_by_title]
        if missing:
            print(f"  ! Not found (fix COLUMN_MAP): {missing}")

    rows_out = []
    for row in sheet.rows:
        record = {k: cell_lookup_by_id(row, col_id_by_title, v, text_only=k in text_only_fields)
                  for k, v in column_map.items()}
        rows_out.append(record)
    return rows_out


def build_related_resources(webinar, content_rows, limit=4):
    matches = []
    for res in content_rows:
        if not res.get("url") or not res.get("title"):
            continue
        if res["title"].strip().lower() == webinar["title"].strip().lower():
            continue  # don't recommend the webinar to itself
        score = 0
        if res.get("campaign") and res["campaign"] == webinar["campaign"]:
            score += 3
        if res.get("useCase") and res["useCase"] == webinar["useCase"]:
            score += 3
        if score == 0:
            continue
        matches.append({
            "title": res["title"],
            "type": res.get("type") or "Resource",
            "campaign": res.get("campaign") or "",
            "useCase": res.get("useCase") or "",
            "url": res["url"],
            "score": score,
        })
    matches.sort(key=lambda m: m["score"], reverse=True)
    return matches[:limit]


def transform(webinar_rows, content_rows):
    webinars = []
    for w in webinar_rows:
        iso_date = normalize_date(w.get("date"))
        record = {
            "id": slugify(w.get("title")),
            "title": w.get("title") or "Untitled webinar",
            "date": iso_date,
            "dateDisplay": pretty_date(iso_date),
            "status": (w.get("status") or "Planned").strip(),
            "campaign": w.get("campaign") or "",
            "useCase": w.get("useCase") or "",
            "audience": w.get("audience") or "",
            "region": w.get("region") or "",
            "owner": w.get("owner") or "",
            "quarter": w.get("quarter") or "",
            "partnerReady": truthy(w.get("partnerReady")),
            "activationStatus": w.get("activationStatus") or "",
            "readiness": readiness_from(w.get("activationStatus")),
            "whyUse": why_use(w.get("audience"), w.get("useCase")),
            "links": {
                "watch": w.get("watch") or None,
                "marketingEmail": w.get("marketingEmail") or None,
                "salesEmail": w.get("salesEmail") or None,
                "paidSocial": w.get("paidSocial") or None,
                "social": w.get("social") or None,
                "attendance": w.get("attendance") or None,
            },
            "sourceRow": w.get("_sourceRow"),
        }
        record["relatedResources"] = build_related_resources(record, content_rows)
        webinars.append(record)
    return webinars


# ---------------------------------------------------------------------------
# SFTP upload (optional)
# ---------------------------------------------------------------------------

def upload_via_sftp(local_path):
    host = os.environ.get("SFTP_HOST")
    if not host:
        print("SFTP_HOST not set -- skipping upload. webinars.json was written locally only.")
        return

    try:
        import paramiko
    except ImportError:
        sys.exit("Missing dependency. Run: pip install paramiko")

    user = os.environ.get("SFTP_USER")
    remote_path = os.environ.get("SFTP_REMOTE_PATH", "webinars.json")
    key_path = os.environ.get("SFTP_KEY_PATH")
    password = os.environ.get("SFTP_PASSWORD")
    port = int(os.environ.get("SFTP_PORT", "22"))

    transport = paramiko.Transport((host, port))
    try:
        if key_path:
            pkey = paramiko.RSAKey.from_private_key_file(key_path)
            transport.connect(username=user, pkey=pkey)
        else:
            transport.connect(username=user, password=password)
        sftp = paramiko.SFTPClient.from_transport(transport)
        sftp.put(local_path, remote_path)
        sftp.close()
        print(f"Uploaded {local_path} -> {host}:{remote_path}")
    finally:
        transport.close()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    token = os.environ.get("SMARTSHEET_API_TOKEN")
    webinar_report_id = os.environ.get("WEBINAR_REPORT_ID")
    content_sheet_id = os.environ.get("CONTENT_SHEET_ID")

    missing = [n for n, v in [
        ("SMARTSHEET_API_TOKEN", token),
        ("WEBINAR_REPORT_ID", webinar_report_id),
        ("CONTENT_SHEET_ID", content_sheet_id),
    ] if not v]
    if missing:
        sys.exit(f"Missing required environment variables: {', '.join(missing)}")

    client = smartsheet.Smartsheet(token)
    client.errors_as_exceptions(True)

    print("Fetching Webinar Calendar report...")
    webinar_rows = fetch_report_rows(client, webinar_report_id, WEBINAR_COLUMN_MAP, "Webinar Calendar", WEBINAR_TEXT_ONLY_FIELDS)
    print(f"  {len(webinar_rows)} rows fetched.")

    print("Fetching Content Mapping Master List...")
    content_rows = fetch_sheet_rows(client, content_sheet_id, CONTENT_COLUMN_MAP, "Content Mapping Master List", CONTENT_TEXT_ONLY_FIELDS)
    print(f"  {len(content_rows)} rows fetched.")

    webinars = transform(webinar_rows, content_rows)

    output = {
        "lastRefreshed": datetime.now(timezone.utc).isoformat(),
        "webinars": webinars,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(f"Wrote {OUTPUT_PATH} with {len(webinars)} webinar records.")

    upload_via_sftp(OUTPUT_PATH)


if __name__ == "__main__":
    main()
