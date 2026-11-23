# Sales & Partner Email Hub v2

## Architecture
The original **PAM to Partner Email Hub** at `pam-email-hub.html` is retained as the single application. V2 functionality is additive in `sales-partner-v2.js`. Existing PAM data feeds, personalization controls, sharing, translation, Word export, and legacy EML export remain intact.

The Content Library (`content-hub.html`) exposes **Create Sales Email** and **Create PAM-to-Partner Email**, each with audience-specific copy. Future approved catalog templates are loaded alongside existing PAM feeds from `sales-partner-email-catalog.json`, but ONLY when `approvalStatus === "Approved"`.

## Add a reusable template
Edit `sales-partner-email-catalog.json`, adding records in this schema:
```json
{
  "id": "unique-stable-id",
  "title": "Approved outreach title",
  "subject": "Email subject",
  "body": "Hi [First Name],\\n\\nApproved text\\n\\nBest,\\n[Your Name]",
  "audience": "Sales",
  "approvalStatus": "Approved",
  "approvalOwner": "Marketing",
  "approvedDate": "2026-11-23",
  "category": "Campaign outreach",
  "objective": "Customer outreach",
  "region": "Global",
  "status": "Ready to personalize",
  "resourceId": "matching-content-library-id-if-any"
}
```
Other permitted audience values are `PAM` and `Both`. For rich templates set `htmlBody` to **reviewed, public-safe** HTML and include an editable plain-text `body` fallback. In a public repository, publish only content and image links that are authorized for external sharing.

**No unapproved template should be marked Approved.** Existing PAM templates are grandfathered into the legacy source feed and default to PAM audience. This catalog is a future controlled publication source, not a permission system; repository write access controls who can edit it.

## CES 2027 pilot
1. Open the Sales & Partner Email Hub in a Chromium browser.
2. Click **Import branded invitation**; select the corrected `Hitachi_CES_2027_INVITATION_FIXED.eml` from the user's device.
3. Confirm the file imports as a Sales invitation with **four embedded images** and the full email HTML.
4. Inspect the hero image, header, columns, image-based call-to-action buttons, spacing above the final website link, and all clickable URLs.
5. Without editing: export the .eml, open as an editable message in **classic Outlook for Windows**, then send a test to yourself.
6. Repeat on **Outlook for Mac**, checking both the opened draft and forwarded received message. Outlook Web import behavior varies, so don't promise .eml draft support there.
7. Make one text edit in the hub, export again, and compare. The unedited export retains the original source HTML including Outlook-specific conditional formatting; edits may cause the browser to normalize markup.
8. Confirm actual link destinations, no missing images, no odd white space, and correct recipient personalization before distributing.
9. If testing reveals client-specific defects, revert to the approved source .EML/.EMLTPL for the November 30 sales distribution. Do not distribute untested exports.

## Security and operational guardrails
- Both GitHub repositories currently available for this project are **public**. Do not commit confidential assets, internal-only invite registration codes, private contact lists, signed or expiring resources, or attachment binaries to them.
- MIME files are imported in browser memory only, max 8 MB. They are not automatically uploaded or published.
- Only CID images physically included in an imported email can be embedded in the exported MIME. HTTPS images remain remotely hosted.
- The rich preview sanitizes executable markup, but files should still originate from trusted internal sources. Links and external images may make network requests when displayed in Outlook or the browser.
- No email is automatically sent. Outlook .EML is not a native Windows .OFT.
- A centrally selectable invitation that includes restricted content needs an approved authenticated storage location (e.g., a controlled SharePoint library with access rights). GitHub Pages alone cannot provide access control.
- To replace the manual catalog with automated publishing, establish a reviewed backend/SharePoint source and a controlled ingestion workflow.

## Rollback
Revert the v2 merge commit on `main` to restore the prior hub. The original template JSON files and email submission workflows are not changed by v2.
