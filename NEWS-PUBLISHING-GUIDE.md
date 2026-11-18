# Global Campaigns News Announcement Builder

**Source of truth:** Smartsheet > Content Mapping Master List. The Content Library and News Builder read its synchronized `content.json`. Do not maintain a second editorial asset database.

**Open:** https://emmeeterry.github.io/Webinar-Activation-Hub/news-publisher.html

## Publish an announcement as SharePoint News that also works in email

1. Select the asset in the News Builder. Search by title/campaign and filter by News Announcement status. Verify the asset is Live, has an approved Description, and the correct image appears. Smartsheet News Announcement = Approved should be confirmed before sending.
2. Click **Copy page title**. In https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23 create **New > News post** and choose a **Made for email** template. Use the copied title.
3. Click **Copy formatted news body** and paste into a native SharePoint **Text** web part. This includes one CTA to the Content Library resource card. Do **not** use a GitHub iframe in an emailed news post.
4. Click **Copy image for SharePoint** or **Download image**. Place the artwork in a native SharePoint **Image** web part. Confirm crop/alt text and select the proper page/news thumbnail. Copy/download produces a PNG of the displayed first frame; if the source GIF is animated and motion matters, upload the original approved GIF instead.
5. Preview **Send by email** and check both the native page and the received email for title, image, description, and links. Obtain final approval and send via SharePoint.
6. Update the same Smartsheet row: **News Announcement = Published**, **News Published URL**, and **News Published Date**. Keep the original Content Library resource card and source-of-truth links unchanged.

## Automatic imagery

- **PDF**: GitHub Actions creates first-page previews into `news-images/<asset-id>.webp`; it does not rewrite the original approved PDF.
- **Webinar/event**: the same workflow attempts to obtain a real image from an accessible Hitachi Vantara or BrightTALK public event page. It does not create generic or fictional marketing artwork. Unavailable images remain flagged for review.
- **Smartsheet**: `Approved News Image URL` provides a preferred, directly embeddable image URL, but a SharePoint `/:i:/s/` *sharing link* may open in the browser while failing in the embedded image. For PDFs, a generated cover can be used instead; for webinars, use an approved public event image or add the original approved file in SharePoint.
- **GIFs**: the browser renders GIFs when provided by a direct URL. Copy/download as PNG is static, so use the original GIF in SharePoint if animation is required.

## Automation and approval boundaries

- The existing Content Library sync runs every two hours.
- The news artwork workflow is `.github/workflows/news-covers.yml`, and also runs every two hours.
- **News drafts are not automatically created in SharePoint**. This requires approved Microsoft 365 authorization and a tested SharePoint News API/Power Automate integration, including News-for-email formatting and the page thumbnail.
- The builder never publishes, emails, or changes Smartsheet records itself.
- For corporate use, confirm site and content-sharing policy before publishing the externally hosted preview.

## Troubleshooting

- If the new Smartsheet News status does not show, verify the Content Mapping Master List synced after `sync_content.py` was updated.
- If a PDF has no cover, inspect the workflow run and the individual PDF's access restrictions.
- If a webinar image is missing, its public event page may not expose downloadable image metadata. Follow the source-image link or place the approved creative into the native SharePoint page.
- If **Copy image** is unavailable, use **Download image**; browsers may restrict clipboard images for cross-origin resources.
