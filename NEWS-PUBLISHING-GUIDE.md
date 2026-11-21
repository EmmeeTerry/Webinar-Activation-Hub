# Global Campaigns | Content Announcement Builder
## Quick team instructions

**Builder:** https://emmeeterry.github.io/Webinar-Activation-Hub/news-publisher.html

Use the builder to prepare announcements from the Smartsheet-synced Content Library. It assembles the selected titles, approved descriptions, images and available promotional links. There is no need to recreate resource cards or maintain a second list of links.

### Start here for EVERY announcement
1. Search or filter content. Choose an asset and click **+ Add selected asset to announcement**. Repeat to include multiple assets. Only added assets are included.
2. Review the combined announcement preview. Check descriptions, titles, artwork, links and Smartsheet approval status. *Ready for review* does not mean approved to publish.
3. Choose the publishing method below. Nothing is published or sent by the builder.

### A. SharePoint News + SharePoint's full-body email
**Use when the same news post must appear on SharePoint and in a SharePoint email.**

- Use **Copy all selected titles**, **1. Copy text + links**, **2. Save approved covers**, and **3. Open SharePoint template**.
- Create a new **Made for email** news post or an approved copy of the original template. Never edit the original.
- Paste the copied content into a SharePoint **Text** web part. Add each approved image separately using native **Image** web parts. The pasted HTML may be restyled by SharePoint and is not a pixel-perfect match for the iframe.
- Check the **SharePoint page preview** AND **Send as email → Preview** before publishing. Obtain sign-off. Once published, update Smartsheet News Announcement status, published URL and date.
- Local image downloads are not automatically SharePoint uploads unless your selected folder is actually OneDrive-synced.

### B. SharePoint branded web embed
**Use when the priority is the polished, full branded experience on a SharePoint page, not full-body SharePoint news email.**

- Click **Preview branded page**, then **Copy iframe for SharePoint**.
- Create a new SharePoint page. Add an **Embed** web part and paste the copied iframe code.
- The iframe includes all added assets, available cover art, resource links and two shared footer sections.
- An iframe is **not** included when SharePoint sends a full-body News email. If sharing by email, send a link to the published page or use Outlook option C.

### C. Formatted Outlook email
**Use to send a designed announcement directly from Outlook, separately from SharePoint's Send as email.**

- Click **Copy formatted email + open Outlook**.
- **Important: Outlook opens with a blank email body.** The builder attempts to copy the designed email to your clipboard at the same time.
- Wait for the builder's **Copied!** confirmation, then click inside the blank Outlook message and press **Ctrl+V**.
- The subject is prefilled. Verify the covers, links and styling; add recipients and send yourself a test first.
- **For Classic Outlook and reliable images:** use **Download Outlook with embedded images (.eml)**. The builder downloads accessible approved covers and embeds them inside the message, converting WebP to PNG where needed. Open the file in Outlook, review its layout and confirm it can be edited. Some Outlook versions open .eml read-only. Images blocked by permissions cannot be embedded, and the builder reports them.
- If using **Copy formatted email + open Outlook**, the compose window opens with an empty body. Wait for the builder to confirm the formatted email was copied, then click the message body and press **Ctrl+V**. Remote images may still be blocked by Outlook.
- If automatic copying fails, click **Copy email only** and paste into Outlook. The **Open plain-text Outlook email** option is the robust fallback with prefilled text and working links but no embedded cover images.
- The Outlook option includes selected covers where accessible via public image URLs, and can render differently in some email clients.

### Keep it clean

- Use approved descriptions and resources from the Smartsheet Content Mapping Master List and the Content Library. Fix missing or incorrect source information there.
- Never create duplicate content inventories, manually redraw resource cards, or email screenshots in place of working Hub links.
- Preview and obtain approval before publishing or sending.
- **Optional/advanced tools** (Copilot and developer exports) are not needed for the normal process and do not create a SharePoint page.

**Useful links**

- [Content Announcement Builder](https://emmeeterry.github.io/Webinar-Activation-Hub/news-publisher.html)
- [Content Sharing Template](https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Content-Sharing-Template.aspx)
- [Content Library](https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Content-Library.aspx)
