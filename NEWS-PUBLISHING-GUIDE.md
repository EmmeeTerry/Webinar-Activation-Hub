# Global Campaigns Content Announcement Builder | Team Quick Start

**Builder:** https://emmeeterry.github.io/Webinar-Activation-Hub/news-publisher.html

The builder uses one source of truth, the Smartsheet-synced Content Library. It assembles the approved content, covers and promotional links for all selected assets.

## 1. Select and review content

Use the visible **Artwork, News status, Publish date, and Sort** filters to find the right assets. Select an asset and click **+ Add selected asset to announcement**. Repeat for multiple assets. Confirm the selected content chips. The single combined preview is below the publishing actions. Check descriptions, artwork, working resource links and Smartsheet approval before distributing.

## 2. Choose ONE of two publishing workflows

### Option A: SharePoint News + Send as email
**Use if you want one SharePoint news post that is also sent as a full-body SharePoint email.**

1. Click **1. Copy content + links** and **2. Save approved covers**.
2. Click **3. Open SharePoint news template**. Create a *new* **Made for email** news post or an approved email-compatible copy of the template. Do not edit the original template.
3. Paste the content into native **Text** web parts and add covers separately through native **Image** web parts.
4. Check the SharePoint page and **Send as email → Preview**. Publish and send only after approval.

**Trade-off:** SharePoint may simplify styling. This cannot be a pixel-perfect copy of the branded iframe, and images do not reliably paste into Text web parts.

### Option B: Branded SharePoint webpage + Outlook email
**Recommended for the most polished announcement. Both parts are needed when distributing the news online and by Outlook.**

**Part 1: Publish the SharePoint page**
1. Click **1. Copy SharePoint iframe** (and **Preview branded SharePoint page** if needed).
2. Create a new SharePoint page, insert an **Embed** web part and paste the iframe.
3. Review and publish the page after approval. The iframe includes all selected assets and both resource footers.

**Part 2: Send the matching Outlook announcement**
1. Click **2. Download Outlook email with embedded covers (.eml)**.
2. Open the downloaded .eml with Classic Outlook. Confirm images and links, and whether the message can be edited. Some versions open .eml read-only. The builder will report any cover it cannot retrieve/convert.
3. Add recipients, send yourself a test, then distribute after approval. Nothing sends automatically.

**Important:** The SharePoint iframe is web-only. It does not appear inside SharePoint's full-body email. The Outlook email is a separate communication. If the .eml file cannot be edited or does not show covers, use an approved internal email workflow or send a normal Outlook message linking to the published SharePoint page. The optional HTML paste method is not recommended in Classic Outlook because it has lost artwork in testing.

## Actions included for EVERY selected article

Each article in the SharePoint iframe, formatted Outlook email, and native SharePoint copy includes:

- Available approved promotional links from the Content Library.
- **Share & Create:** **Create Customer Email** (when a shareable asset URL exists), **Create PAM-to-Partner Email**, and **Overview Slide**, linking to the same tools used by that asset's Content Library card.
- **Asset details:** available campaign, use case, funnel stage, ownership, audience, region, status, publish date, promotion period and primary activation from the source.
- Unavailable resource links are omitted, not replaced with broken placeholders. Upcoming webinars link back to their Content Library card for the **Add to calendar** action; already-passed webinar calendar actions are omitted.

These are internal enablement actions and metadata. Check the recipients before emailing the announcement outside the organization.

## Standard links in every email

All generated announcement email formats, including Outlook HTML, embedded-image EML, plain-text email, and SharePoint news copy for email, include these links in both the **header and footer**:

- **News and Updates:** https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Global%20Campaigns.aspx
- **Global Campaigns Hub:** https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Global%20Campaigns.aspx

The Customer Email and PAM-to-Partner Email tools launched from each content card also apply the same links to generated email output. Both labels currently use the exact same SharePoint URL as provided.

## 3. Keep the process efficient

- Only one combined content preview is shown below the publishing buttons. It does not guarantee how Outlook or SharePoint will render.
- Filters are always visible. Saved views, Copilot exports and technical tools are optional.
- Update incorrect source content in Smartsheet, not in recreated screenshots, copied resource cards or duplicate spreadsheets.
- Confirm content approval. Never overwrite the original SharePoint template. After publishing, record the News Published URL, date and status in Smartsheet.

**Links:**
- [Content Announcement Builder](https://emmeeterry.github.io/Webinar-Activation-Hub/news-publisher.html)
- [Content Sharing Template](https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Content-Sharing-Template.aspx)
- [Content Library](https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Content-Library.aspx)
