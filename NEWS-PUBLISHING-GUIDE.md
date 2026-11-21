# Global Campaigns | Content Announcement Builder
## Team quick start for Suchi and Steph

**Builder:** https://emmeeterry.github.io/Webinar-Activation-Hub/news-publisher.html

**Purpose:** Prepare approved Global Campaigns content announcements from the Content Library, using the data synchronized from Smartsheet. Do not recreate content cards or maintain a separate list of links.

### The standard workflow: SharePoint News that can also be emailed

1. **Find and select approved content.** Search/filter, choose an asset, and click **+ Add selected asset to announcement**. Repeat for multiple assets. Only assets you explicitly add appear in the combined announcement.
2. **Review the combined preview.** Verify full titles, the approved Smartsheet descriptions, available artwork and promotional resource links. Confirm actual editorial/News Announcement approval status in Smartsheet. *Ready for review* does not mean approved to publish.
3. **1. Copy page title.** The title includes all selected asset titles in selection order.
4. **2. Copy text + links.** The builder copies a formatted HTML/text fragment for a SharePoint **Text** web part. SharePoint may simplify styling. This does **not** copy artwork into SharePoint.
5. **3. Download approved covers.** In Chrome/Edge choose a local folder, or use the downloaded ZIP where the folder picker is unavailable. The builder attempts to save every selected cover and tells you if an image could not be retrieved. Unzip if necessary and upload covers into the appropriate native SharePoint **Image** web parts. Saving locally does not upload to SharePoint unless the folder is actually OneDrive-synced.
6. **4. Open SharePoint template.** Use the **Content Sharing Template**, make **New → Copy of this post** when available, and never overwrite the original. If you intend to distribute the full article by email, start with an approved **Made for email** news template; a generic copied post is not guaranteed to support it. Paste your title and copy, and add covers as native Image web parts.
7. **Review before publishing.** Confirm that text, images, links and spacing look right in the SharePoint page. For full-body email, use **Send as email → Preview** and verify the entire article appears. Obtain normal approval before publishing or sending.
8. **Record publication.** After publishing, update the source Smartsheet row(s) with the published news URL and date and the correct News Announcement status.

**Important limitation:** A pasted Text web part will not look identical to the custom web iframe. SharePoint can alter inline styles and won't reliably paste images. A native, email-supported SharePoint layout is the reliable path for full-body SharePoint emails.

### Optional: fully branded web-only page

Expand **Other publishing options → Web-only: full branded iframe**, preview the rendered page and click **Copy web iframe code**. Paste into a SharePoint **Embed** web part. This includes the combined assets, their available covers, and both shared resource footers. It looks closest to the original design, but **cannot be sent as a full-body SharePoint News email**. If the page itself must be emailed, use a link to the web page or use the standard native-news path above.

### Optional: separate email from an HTML-capable platform

Under **Other publishing options → Separate email outside SharePoint**, use **Copy formatted email** or **Download email HTML file**. This is for an editor that supports HTML and is **not** a direct input to SharePoint's Send as email. Verify external image loading and test-send.

### Advanced only

The Copilot briefing and technical ZIP are tucked into **Advanced**. In the tested Microsoft Copilot session, the available tools couldn't create or edit the modern SharePoint page. Do not treat these files as finished pages or publication actions.

### Useful links

- **Content Library:** https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Content-Library.aspx
- **Content Sharing Template:** https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Content-Sharing-Template.aspx
- **Announcement Builder:** https://emmeeterry.github.io/Webinar-Activation-Hub/news-publisher.html

**Source of truth:** Smartsheet Content Mapping Master List, as synchronized into the Content Library. Correct missing descriptions, links, or artwork in the source workflow, not in a separate announcement spreadsheet.
