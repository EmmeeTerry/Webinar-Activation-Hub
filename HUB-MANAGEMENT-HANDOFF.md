# Content Library & Webinar Activation Hub: Shared Management Guide

**Purpose:** Shared operating guide for Emmee, Stephanie, and Suchi. All three should be able to maintain the content and webinar hubs without depending on a single administrator.

## Ownership (proposed)
- **Suchi**: Content Library primary steward
- **Stephanie**: Webinar Activation Hub primary steward
- **Emmee, Stephanie, and Suchi**: GitHub repository, publishing, troubleshooting, and enhancement collaboration
- Actual collaborators and Smartsheet/SharePoint permissions must be granted separately; documenting ownership does not grant access.

## Architecture
Smartsheet source records -> GitHub Actions scheduled sync -> `content.json` or `webinars.json` -> GitHub Pages HTML -> embedded SharePoint pages.

GitHub repository: https://github.com/EmmeeTerry/Webinar-Activation-Hub
Content Library: https://emmeeterry.github.io/Webinar-Activation-Hub/content-hub.html
Webinar Activation Hub: https://emmeeterry.github.io/Webinar-Activation-Hub/
Content SharePoint: https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Content-Library.aspx
Webinar SharePoint: https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Webinars-for-Sales-%26-Marketing.aspx

## Sources
- **Content Library**: Smartsheet Content Mapping Master List. Source sheet URL: https://app.smartsheet.com/sheets/F8fXxVqMxMvCV34xP76gvG72xPc5JvcMGQ9cXc91
- **Webinars**: Smartsheet Webinar Calendar report: https://app.smartsheet.com/reports/WRRxRxh9HMhcmp4h7cQ9wJg766r76R5rMCM3H7j1
- **Content submission**: https://emmeeterry.github.io/Webinar-Activation-Hub/add-content.html (wraps a Smartsheet submission form)
- `sync_webinars.py` also refers to the Content Mapping Master List for related resources.

## Day-to-day updates
1. Add or correct the **source record in Smartsheet**, including status, links, dates, owner, campaign/use case, region, and supporting activation emails or assets.
2. Confirm that the record is in the correct source sheet/report and matches existing Smartsheet column values.
3. Allow scheduled GitHub Actions to run, or manually use **GitHub -> Actions -> workflow -> Run workflow**.
4. Check the GitHub Pages page, then the corresponding SharePoint embedding.
5. If new entries are missing, check workflow run logs and the source record before changing the HTML.

### Automation
- Webinar workflow: `.github/workflows/sync.yml`; runs every two hours on the hour (UTC schedule); runs `sync_webinars.py`; writes `webinars.json`.
- Content workflow: `.github/workflows/content-sync.yml`; runs every two hours, 30 minutes offset; runs `sync_content.py`; writes `content.json`.
- Repository secrets referenced: `SMARTSHEET_API_TOKEN`, `WEBINAR_REPORT_ID`, `CONTENT_SHEET_ID`. Never put token values in files, chat, screenshots or commit messages.
- Timing of GitHub Actions scheduled triggers may vary. SharePoint can also cache embedded pages.

## Files
- `index.html` Webinar Hub layout, filtering and webinar details
- `content-hub.html` Content Library layout, search and content details
- `add-content.html` Content submission page
- `sync_webinars.py` webinar Smartsheet mapping and transformation
- `sync_content.py` content Smartsheet mapping and transformation
- `webinars.json` and `content.json` generated publication data. **Do not manually edit generated JSON as a lasting fix**; the next sync overwrites it.
- `.github/workflows/sync.yml` and `.github/workflows/content-sync.yml` scheduling and sync steps

## Technical safeguards
- **Webinar report cells**: `sync_webinars.py` has report-specific positional mapping logic. Do not replace with generic sheet-column-ID matching without verifying the Smartsheet report response schema.
- **Content sheet**: `sync_content.py` maps by column IDs. Preserve it when modifying data transformations.
- New/renamed Smartsheet column headers can break mappings in the corresponding Python script.
- Use a branch + pull request for code changes and ask another of the three maintainers to review when practical. Prefer source-data edits for routine maintenance.
- Repository/GitHub Pages may be publicly accessible. Never add secrets or partner-confidential/nonpublic data to generated JSON or HTML; verify distribution authorization.

## Troubleshooting
1. **Missing webinar/content**: verify source row, data eligibility/status, required links, and report membership.
2. **Stale data**: look at the last successful GitHub Actions run and latest commit to the corresponding JSON.
3. **Sync error**: Actions -> relevant workflow -> failed run -> error log. Identify auth (Smartsheet token / permissions), column mismatch, or Git push failure.
4. **GitHub Pages updated but SharePoint stale**: check the direct GitHub Pages URL, then reload SharePoint; investigate embed/cache separately.
5. **Broken activation links**: correct the source link, sync, and recheck the published page.
6. **Formatting or filter bug**: modify the correct HTML file through a PR, then test both direct GitHub Pages and SharePoint embedding.

## One-time shared access checklist
- [ ] Invite Stephanie and Suchi as GitHub repository collaborators with **Write** or an appropriate maintainer role.
- [ ] Confirm each can view/edit the Content Mapping Master List and Webinar Calendar source/report (and underlying sheet access as needed).
- [ ] Confirm each can edit the two SharePoint pages and their embeds.
- [ ] Confirm each can open GitHub Actions and manually dispatch the relevant workflow.
- [ ] Confirm the GitHub Actions Smartsheet credentials will remain valid and have appropriate nonpersonal ownership/rotation procedures.
- [ ] Have Suchi complete a real content change and Steph complete a real webinar update; each verifies data, sync, GitHub Pages, and SharePoint.
- [ ] Agree on one shared location to document issues and enhancements.

## Related hubs (not part of this specific handoff)
- PAM Email Hub: `pam-email-hub.html`; manually curated repository `pam-email-repository.json` and automated partner communications feed `pam-partner-submissions.json`.
- The latter has its own `.github/workflows/sync-partner-communications.yml` and Smartsheet input sheet. Do not change it casually while updating webinars/content.
