import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const url='http://127.0.0.1:8765/pam-email-hub.html?email=sales-ces-2027-invitation&audience=Sales';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({acceptDownloads:true});
const page=await context.newPage();
page.on('pageerror',e=>console.error('BROWSER ERROR:',e.stack||e.message));
page.on('console',m=>{if(m.type()==='error')console.error('BROWSER CONSOLE:',m.text())});
try{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('#title').filter({hasText:'Hitachi at CES 2027'}).waitFor({timeout:25000});
 await page.waitForFunction(()=>document.querySelector('#eml')?.disabled===false,{timeout:25000});
 await page.locator('#contactPersonalizeOptions summary').click();
 const csv='First Name,Partner Company,Email,Your Name\nAlex,Sample Partner,alex@example.com,Sales Representative\n';
 await page.locator('#leadFile').setInputFiles({name:'recipients.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
 await page.locator('#leadSelect').selectOption('0');
 await page.locator('#prepareContactEmail').waitFor();
 assert.equal(await page.locator('#prepareContactEmail').isEnabled(),true,'Selected contact should enable Outlook draft');
 const [draftDownload]=await Promise.all([
  page.waitForEvent('download'),
  page.locator('#prepareContactEmail').click()
 ]);
 const mime=await readFile(await draftDownload.path(),'utf8');
 assert(mime.includes('To: alex@example.com'),'Prepared draft must be addressed to the selected contact');
 assert(mime.includes('Content-ID: <ces-2027-embedded-1@hitachi>'),'The first CES embedded image should be packaged');
 assert.equal((mime.match(/Content-ID: </g)||[]).length,4,'All four original CES images should remain packaged');
 assert(mime.includes('X-Unsent: 1'),'Outlook MIME must remain unsent');
 console.log('PASS: CSV -> selected contact -> addressed EML with four embedded images');

 // Flow: review the email (step 2), then send it (step 3).
 const order=await page.evaluate(()=>{const e=document.getElementById('edit');return [document.getElementById('richEmail'),e.querySelector('#eml'),document.getElementById('contactPersonalizeOptions')].map(n=>[...e.querySelectorAll('*')].indexOf(n))});
 assert(order[0]>=0&&order[0]<order[1]&&order[1]<order[2],'Preview, then Outlook send actions, then contact-list sending');
 assert.equal(await page.locator('#translateOptions').count(),0,'Translate controls were removed');
 assert.equal(await page.getByText('How to use email templates',{exact:true}).count(),1,'Guide link should appear once');
 console.log('PASS: send actions first, Translate removed, guide link shown once');

 // When clipboard APIs are blocked, the action must expose a selectable
 // HTML alternative, not a broken promise or an uncaught permission error.
 await page.locator('#copy').click();
 await page.waitForFunction(()=>/copied|selected|Opened a (?:full )?browser tab/i.test(document.querySelector('#outlookStatus')?.textContent||''),{timeout:15000});
 console.log('PASS: formatted copy confirms a copy or usable fallback');
 const webOpen=page.locator('#openOutlookWeb');
 const desktopOpen=page.locator('#openDesktopEmail');
 assert(await webOpen.isVisible(),'Open Outlook web action should be visible beside Copy');
 assert(await desktopOpen.isVisible(),'Open default desktop email app should be visible');
 assert((await webOpen.getAttribute('href')).startsWith('https://outlook.office.com/mail/deeplink/compose?subject='));
 assert.equal(new URL(await webOpen.getAttribute('href')).searchParams.get('to'),'alex@example.com');
 assert(decodeURIComponent(await desktopOpen.getAttribute('href')).startsWith('mailto:alex@example.com?subject='));
 await page.locator('#subject').fill('Personalized CES invitation');
 assert((await webOpen.getAttribute('href')).includes('Personalized%20CES%20invitation'),'Outlook link should follow edited subject');
 console.log('PASS: Outlook web and desktop compose links are visible and use the edited subject');

 // Simulate a SharePoint-like sandbox that does not grant popup or clipboard
 // permissions. Users must still get a selectable email rather than an error.
 const embedded=await context.newPage();
 await embedded.setContent('<iframe id="sharepoint" sandbox="allow-scripts allow-same-origin allow-forms" src="'+url+'" style="width:1200px;height:1000px"></iframe>');
 const inner=embedded.frameLocator('#sharepoint');
 await inner.locator('#title').filter({hasText:'Hitachi at CES 2027'}).waitFor({timeout:25000});
 await inner.locator('#copy').click();
 const sandboxResult=await inner.locator('#outlookStatus').innerText();
 assert(/copied|selected|Opened a (?:full )?browser tab/i.test(sandboxResult),'Sandboxed copy should offer usable copy instructions: '+sandboxResult);
 console.log('PASS: sandboxed SharePoint-style embed provides a clipboard fallback');
 await embedded.close();

 const assetPage=await context.newPage();
 const assetBase='http://127.0.0.1:8765/pam-email-hub.html?audience=PAM&source=content&title=Regression%20test%20asset';
 await assetPage.goto(assetBase+'&description=Test%20description&url=https%3A%2F%2Fexample.com%2Fasset');
 await assetPage.locator('#title').filter({hasText:'Regression test asset'}).waitFor({timeout:25000});
 assert((await assetPage.locator('#body').inputValue()).includes('https://example.com/asset'),'Generated partner draft must contain selected asset URL');
 await assetPage.goto(assetBase);
 await assetPage.locator('#title').filter({hasText:'Regression test asset'}).waitFor({timeout:25000});
 assert((await assetPage.locator('#body').inputValue()).includes('[Insert published asset link before sending]'),'Planned asset must produce a contextual draft with a link placeholder');
 await assetPage.close();
 console.log('PASS: contextual partner draft and missing asset guard');

}finally{
 await browser.close();
}
