#!/usr/bin/env python3
"""Publish a tiny inventory of generated image files for the News Builder."""
import json
from datetime import datetime,timezone
from pathlib import Path

items=[]
types={}
if Path("content.json").exists():
    types={item.get("id"):item.get("type","Unknown") for item in json.loads(Path("content.json").read_text(encoding="utf-8")).get("items",[])}
for path in sorted(Path("news-images").glob("*.webp")):
    if not path.is_file(): continue
    item_id=path.stem
    items.append({"id":item_id,"path":path.as_posix(),"type":types.get(item_id,"Unknown")})
out={"generatedAt":datetime.now(timezone.utc).isoformat(),"images":items}
Path("news-images-manifest.json").write_text(json.dumps(out,indent=2)+"\n",encoding="utf-8")
print("Manifest contains",len(items),"images")
