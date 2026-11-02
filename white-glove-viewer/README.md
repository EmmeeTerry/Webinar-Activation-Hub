# White Glove Program viewer (draft)

This directory contains a responsive PDF slide viewer intended to be embedded on a StructuredWeb landing page.

## Security
Do **not** publish a private or internal deck to GitHub Pages. GitHub Pages serves this directory publicly once merged to the published branch. Obtain approval for every slide before publishing. The original SharePoint PPTX remains private.

## Files
- `index.html`: presentation viewer with slide arrows, counter, keyboard controls and full screen.
- `presentation.pdf`: **not included**. An approved, public viewing copy must be published to this exact path.

## StructuredWeb embed (after approval and merge)
```html
<iframe src="https://emmeeterry.github.io/Webinar-Activation-Hub/white-glove-viewer/"
 title="White Glove Program presentation" loading="lazy"
 style="width:100%;height:min(65vw,720px);min-height:310px;border:0" allowfullscreen></iframe>
```
Check actual GitHub Pages publication path before using.

## Planned automated publishing
1. SharePoint: trigger on changes to the approved White Glove Program PPTX.
2. Power Automate: convert the updated presentation into a PDF using a connector that is confirmed to support this source file and output format. Conversion may require a temporary file in OneDrive for Business or an approved conversion service.
3. Apply a publication/approval gate, and update the **public** `white-glove-viewer/presentation.pdf` file in GitHub using an approved authenticated integration.
4. GitHub Pages serves the newly uploaded PDF at a stable URL. The viewer uses a cache-busting query on load, so reopening/refreshing the page loads the current published copy. Existing open browser tabs do not receive instant pushed updates.

**Status:** Step 1 viewer implementation only. No SharePoint flow, conversion, credentials, publishing gate, or presentation file has been connected.
