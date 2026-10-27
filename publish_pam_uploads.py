#!/usr/bin/env python3
"""Compile collaborator-uploaded public-approved PAM email templates into separate JSON feed."""
import json
from pathlib import Path
FOLDER=Path("pam-email-submissions")
OUT=Path("pam-uploaded-emails.json")
ALLOWED={"id","category","title","subject","body","region","objective","status"}
emails={}
for f in sorted(FOLDER.glob("*.json")):
    obj=json.loads(f.read_text(encoding="utf-8"))
    if not isinstance(obj,dict) or obj.get("status")!="Owner-confirmed for public publication":
        raise ValueError(f"{f}: missing owner public publishing confirmation")
    for key in ["id","title","subject","body","category"]:
        if not isinstance(obj.get(key),str) or not obj[key].strip():
            raise ValueError(f"{f}: invalid or empty {key}")
    if not obj["id"].startswith("uploaded-") or len(obj["id"])>100:
        raise ValueError(f"{f}: invalid template id")
    if len(obj["body"])>25000 or len(obj["subject"])>400:
        raise ValueError(f"{f}: template too long")
    if obj["id"] in emails:
        raise ValueError(f"{f}: duplicate ID")
    emails[obj["id"]]={k:v for k,v in obj.items() if k in ALLOWED}
OUT.write_text(json.dumps({"version":"1.0","emails":list(emails.values())},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Validated {len(emails)} published PAM templates.")
