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

## 2. Create a native SharePoint news draft

- In the builder, select **1. Copy page title**.
- Click **4. Open SharePoint site**. On the Global Campaigns communications site, choose **New → News post** and select a **Made for email** template if available.
- Paste the title into the SharePoint page title. Save it as a draft while working.
- **Do not use an iframe for news intended to be sent by email.** An iframe can display inside a web page but generally will not appear correctly in an emailed news article.

**SharePoint site:** https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23

## 3. Add text, CTA, and artwork

- Click **2. Copy formatted news body** in the builder. Paste into a native SharePoint **Text** web part. Confirm the description and the **Explore asset and activation resources** CTA remain formatted and clickable.
- Click **3. Copy image** or **3. Download image instead**. Add the image to a native SharePoint **Image** web part. Download/upload is the fallback if the browser blocks image clipboard access.
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
