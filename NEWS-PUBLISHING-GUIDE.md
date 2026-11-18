# Global Campaigns | News Announcement Publishing Instructions

**Audience:** Stephanie (Steph), Suchi, and authorized Global Campaigns publishers.

**Use the working builder:** https://emmeeterry.github.io/Webinar-Activation-Hub/news-publisher.html

**Where content comes from:** the Smartsheet **Content Mapping Master List**, automatically synchronized into the Content Library. Do not create a second spreadsheet, duplicate the asset record, edit GitHub, or add content directly to this page.

**Important:** The News Announcement Builder prepares content and artwork. It **does not** automatically create a SharePoint page, publish, approve an article, or email anyone.

## 1. Choose and review an asset

- Open the builder. In **Asset readiness**, choose **Ready for review** to narrow to assets with an image, a nonempty description, and status **Live**. Use **Has image** to explore other assets.
- Select the asset and inspect its title, campaign, description, image, and CTA. Open the CTA to verify it reaches the correct **Content Library resource card**, not the wrong asset.
- **Ready for review is not approval to publish.** Confirm the Smartsheet News Announcement approval/status and follow the team's normal editorial/marketing sign-off process. If the expected approval status isn't populated yet, verify the Smartsheet row directly before continuing.
- If the description is empty, inaccurate, or unapproved, correct the **Description** in Smartsheet first. If artwork is missing or incorrect, obtain/confirm approved artwork before continuing.

## Confirmed destinations for this team

- **Saved page/template reference:** https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/Content-Sharing-Template.aspx
- **Shared image library folder:** https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/Shared%20Documents/Content%20Announcement%20Images
- **Emmee's existing Windows OneDrive shortcut (only on her PC):** `C:\\Users\\mterry\\OneDrive - Hitachi Vantara\\Documents - To-Partner Communications FY23\\Content Announcement Images`

The builder now has **Open SharePoint template** and **Open shared image folder** buttons. Opening the template link may open the template page for viewing/editing rather than automatically creating a new page. Always create a **new** news post from the saved site template; never overwrite the original template.

To save images straight into the synced folder (desktop Chrome/Edge):
1. Open the News Announcement Builder **in its own browser tab**, not inside SharePoint's iframe, because embedded pages may not be granted browser folder-picker permissions.
2. Click **Change folder** once. In the folder chooser, navigate to your *own* OneDrive-synced **Content Announcement Images** folder and approve access. Do not choose an unrelated Downloads folder.
3. Select an asset and click **Save image to synced folder**. The builder remembers the folder in this browser. Browser permissions may require reapproval, and a new browser/device requires selecting the folder again.
4. Confirm the image has appeared in the SharePoint **Content Announcement Images** folder once OneDrive syncs it. Use the image in your native SharePoint news post.
5. If your organization's browser restrictions block folder access, use **Download image**, then manually save/move it to the synchronized folder.

**Important:** This saves the generated **PNG** to the *local* OneDrive-synced folder; it does not directly upload to SharePoint. OneDrive provides that synchronization. The current action saves using the asset ID as the filename; saving the same asset again replaces the existing local file. An animated GIF becomes a static PNG. Do not assume a generated image is approved until it is reviewed. Each user's Windows OneDrive path will differ.

## Reusable SharePoint template: Global Campaigns Asset Announcement

Create this once on the SharePoint site so the team does not reassemble each announcement from scratch:

1. On the Global Campaigns SharePoint site, select **New > News post** and choose a **Made for email** template.
2. Design the native page as an asset announcement: a concise title, an image web part, a Text web part for the asset description and CTA, and a short closing prompt pointing readers to the Content Library. Keep the layout simple and reusable. Do not paste a specific asset's complete description or use a fixed URL in the template.
3. In the page editor, open the menu beside **Save as draft** (or the available page options) and choose **Save as template** / **Save as page template**. Name it **Global Campaigns Asset Announcement**.
4. Verify it appears in the site's **Saved on this site** news-template gallery and has the email-compatible indicator. Only then share its actual accessible link with the team.
5. For each announcement, select that saved template, paste the News Builder's title and formatted body, insert its image, check links and email preview, get approval, and publish/send. Maintain the published URL/date on the existing Smartsheet row.

**Linking:** The builder opens the actual supplied **Content Sharing Template** page. To make a new announcement, select a saved site template through the SharePoint news-template gallery. The page link itself is not guaranteed to instantiate a new news post.

## Two publishing options: choose the right one

### Optional: Branded embedded SharePoint page (best visual design)

1. Select your asset in the builder and verify its title, message, image and CTA. Confirm approval.
2. Click **Preview full page** to see what the audience will see.
3. Click **Copy SharePoint embed code**. In SharePoint, create or edit the intended web page. Add an **Embed** web part and paste the iframe code. Resize the web part or its height if required.
4. Preview the SharePoint page and check the links and artwork; obtain approval before publishing. Record the published page URL/date in Smartsheet if this is an approved news announcement.

**Important:** Embedded pages are for the **web only**. SharePoint's emailed news format does not reliably render iframes. Do not email an iframe expecting the polished embedded article to appear in the email body. Also ensure the intended audience is permitted to view the externally hosted content.

### Default: Native SharePoint news (for email distribution)

## 2. Create a native SharePoint news draft

- Expand **Publishing as SharePoint news or email?**, then select **Copy title**.
- Click **Open SharePoint template**. On the Global Campaigns communications site, choose **New → News post** and select a **Made for email** template if available.
- Paste the title into the SharePoint page title. Save it as a draft while working.
- **Do not use an iframe for news intended to be sent by email.** An iframe can display inside a web page but generally will not appear correctly in an emailed news article.

**SharePoint site:** https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23

## 3. Add text, CTA, and artwork

- Expand **Publishing as SharePoint news or email?**, then click **Copy formatted body** in the builder. Paste into a native SharePoint **Text** web part. Confirm the description and the **Explore asset and activation resources** CTA remain formatted and clickable.
- Click **Copy image** or **Download image**. Add the image to a native SharePoint **Image** web part. Download/upload is the fallback if the browser blocks image clipboard access.
- Review the crop, alt text, image resolution and SharePoint news/page thumbnail.
- The image copy/download action exports a **static PNG** of the displayed frame. If the approved original is an animated GIF and the animation is required, insert the original GIF instead.

## 4. Get approval, publish, send, and record the result

- Save the draft. Confirm the required approval and recipient audience before publishing.
- Preview the **native SharePoint page** and **email** (if the email-news option is supported on the site). Check title, body, image, and links. Send a review/preview copy to the designated reviewers if required.
- Only after approval: publish the SharePoint news post and use its **Send by email** option if appropriate. Do not send an unapproved asset or internal-only material.
- Update the **same Smartsheet asset row**: **News Announcement = Published**, **News Published URL**, and **News Published Date**. The existing Content Library asset remains unchanged.

## What is automatic vs. manual?

| Automatic | Still requires a person |
| --- | --- |
| Smartsheet content sync (every two hours) | Correct and approve Smartsheet descriptions / artwork |
| PDF cover thumbnails | Verify generated cover is the right approved artwork |
| Retrieval of some public webinar/event images | Check event art and select a replacement when none is available |
| Generated title, formatted copy, CTA, readiness filters | Create the native SharePoint draft, apply final approval, publish/send, update Smartsheet |

## Missing image or missing description?

- **PDF:** The GitHub workflow attempts to generate a cover from the public PDF's first page. If the original is restricted, it may fail. Check that the cover matches the approved resource.
- **Webinar:** The workflow tries to use actual public Hitachi Vantara or BrightTALK page images. Some pages have no accessible or appropriate image. Do not invent an asset visual.
- **SharePoint image-sharing link:** A SharePoint link to an image page may open for you but not display as an image in the public GitHub iframe. When necessary, use the approved original artwork file as a native SharePoint image.
- **No Description:** The builder may show a fallback sentence, but that is **not approved marketing copy**. Fill in and approve the Description in Smartsheet before publication.
- **Newly updated content not visible:** The Smartsheet-to-GitHub synchronization runs on a schedule; check again after its next successful run. The artwork generator also runs on a schedule.
- **Copy image doesn't work:** Use **Download image** and upload the file into SharePoint.

**Questions about publishing permissions or approval:** Use the existing Global Campaigns approval owner/process; do not assume a “Live” asset is automatically approved for a news or email announcement.
