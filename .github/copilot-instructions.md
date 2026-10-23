# Copilot instructions: Webinar Activation Hub and Content Library

This repository powers two Smartsheet-synchronized GitHub Pages resources embedded into Hitachi Vantara SharePoint.

Before changing anything, read `HUB-MANAGEMENT-HANDOFF.md`.

## Live products
- Webinar Activation Hub: `index.html`, published at https://emmeeterry.github.io/Webinar-Activation-Hub/
- Content Library: `content-hub.html`, published at https://emmeeterry.github.io/Webinar-Activation-Hub/content-hub.html
- Smartsheet submission page: `add-content.html`
- PAM email hub is also in this repository, but is a separate product. Do not change it unless asked.

## Data flow
Smartsheet -> GitHub Actions -> generated JSON -> GitHub Pages -> SharePoint embed.
- Webinar: `sync_webinars.py` -> `webinars.json`, action `.github/workflows/sync.yml`.
- Content: `sync_content.py` -> `content.json`, action `.github/workflows/content-sync.yml`.
- Both synchronize approximately every two hours.
- A normal record update belongs in Smartsheet, not an HTML edit or a manual JSON patch.

## Nonnegotiable safeguards
1. In `sync_webinars.py`, preserve report **positional cell matching**; do not replace it with the ID-based approach used for sheet rows.
2. In `sync_content.py`, preserve **column ID matching**.
3. Do not edit `webinars.json` or `content.json` as a permanent fix; they are regenerated.
4. Never expose Smartsheet API credentials, tokens, repository secrets, personal information, or restricted partner content in public GitHub Pages or JSON. Treat this repository and GitHub Pages as public.
5. Retain existing features, filtering, links, and integrations unless the task explicitly requests their removal.
6. Do not change the PAM email hub, its template repository, or its partner submission workflow unless expressly in scope.
7. Prefer small, reviewable commits/pull requests; test the relevant UI and sync script for each change. Do not claim publication has completed unless verified.
8. For GitHub coding agent tasks, make changes on a branch, open a PR, explain what changed, how tested, any Smartsheet/SharePoint dependencies, and give the live page URL to verify after merge.

## Routine requests
- Missing or incorrect webinar: investigate Smartsheet Webinar Calendar report/source, mapping and filtering, workflow run, and JSON output.
- Missing or incorrect content: investigate Smartsheet Content Mapping Master List/source, mapping, workflow run, and JSON output.
- UI change: edit the corresponding HTML/CSS/JS only, preserve existing functionality, and verify both desktop/mobile where possible.
- If the request requires changes to Smartsheet or SharePoint and those systems are not connected, state the limitation and provide precise steps for the person with access. Do not pretend a GitHub change also updated Smartsheet or SharePoint.

## Ownership
Stephanie Thompson primarily stewards webinar content; Suchi (Sulochna Khokhrai) primarily stewards content-library items; Emmee Terry remains a shared collaborator. All three should use the same repository and review proposed changes collaboratively.
