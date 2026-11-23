# Sales & Partner Email Hub v2 (pilot)

## What changed
- Existing `pam-email-hub.html` is extended, not replaced.
- Audience filter supports Sales, PAMs, Both, and All audiences. Existing catalog entries default to PAM; a locally imported invitation defaults to Sales. Future catalog records can set `audience: "Sales" | "PAM" | "Both"`.
- Local import accepts .eml and .emltpl MIME messages (up to 8 MB). It extracts HTML, text, MIME subject, and embedded CID images for preview and export.
- Imported content remains in browser session memory. No uploaded invitation or images are committed to this PUBLIC repository.
- Rich image EML exporter writes `multipart/related` with HTML and inline Content-ID parts, preserving original CID references.
- Existing plain-text/HTML templates continue to use their established controls.
- Content Library resource modal continues to link into the same hub, with updated Sales/Partner labeling.

## CES 2027 pilot
1. Open `pam-email-hub.html` in the feature branch deployment or test environment.
2. Select **Import branded invitation**, and choose the corrected `Hitachi_CES_2027_INVITATION_FIXED.eml` file.
3. Confirm 4 embedded CID images are detected, that no large blank space is present near the bottom, and that images/CTAs look correct.
4. Edit recipient personalization where required, then download the new `.eml`.
5. Open as an unsent message in classic Outlook for Windows, Outlook for Mac, and Outlook Web (where supported). Check full layout, images, links, editable text, and a forwarded self-test.
6. Compare the output side-by-side with the corrected source; pay particular attention to Outlook-specific conditional comments after editing HTML.
7. Do NOT use as a mass-distribution template until these checks pass.

## Limitations and guardrails
- MIME parsing is designed for ordinary Outlook .eml/.emltpl messages. Test other charset, nested MIME, and rich-image formats separately.
- A draft generated from the Content Library is still a new personalized outreach draft, not an automatically matched approved campaign email. The dedicated catalog mapping workflow is future work.
- Importing an invitation does not publish a reusable centrally hosted template. An approved public-safe storage and publishing process is needed to make it permanently selectable by other users.
- Outlook rendering differs by version; this is not a guarantee of pixel-identical rendering or a native .oft file.
- External images referenced by https are not embedded; this importer preserves CID images actually present in the uploaded MIME.
- No emails are sent automatically; recipients and approval remain the sender's responsibility.
