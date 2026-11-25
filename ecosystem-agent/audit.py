"""Read-only heuristic inventory. No network calls, no source excerpts."""
import argparse
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent

def audit(root, campaign_root=None):
    registry = json.loads((HERE / "registry.json").read_text())
    report = {"status": "heuristic; not functional verification", "capabilities": [], "missing": []}
    files = {}
    for product, paths in registry["products"].items():
        files[product] = {}
        for name in paths:
            if name.startswith("Global-Campaigns-Resource-Hub/"):
                path = campaign_root / name.split("/", 1)[1] if campaign_root else None
            else:
                path = root / name
            if path is None or not path.is_file():
                report["missing"].append(name)
                continue
            files[product][name] = path.read_text(encoding="utf-8", errors="replace")
    for cap in registry["capabilities"]:
        pattern = re.compile(cap["pattern"], re.I)
        evidence = {}
        for product in cap["products"]:
            evidence[product] = {name: len(pattern.findall(source)) for name, source in files[product].items() if pattern.search(source)}
        report["capabilities"].append({"id": cap["id"], "target": cap["target"], "candidate_matches": evidence,
            "cross_product_candidate": sum(bool(v) for v in evidence.values()) > 1})
    return report

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--root", type=Path, default=HERE.parent)
    p.add_argument("--campaign-root", type=Path)
    args = p.parse_args()
    print(json.dumps(audit(args.root, args.campaign_root), indent=2))
