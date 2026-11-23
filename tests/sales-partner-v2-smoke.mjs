import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src=readFileSync(new URL('../sales-partner-v2.js',import.meta.url),'utf8');
const between=(start,end)=>{
  const i=src.indexOf(start),j=src.indexOf(end,i+start.length);
  assert(i>=0&&j>i,'Missing MIME source section '+start);
  return src.slice(i,j);
};
const mimeCore=between('function partBytes(body,encoding){',"const CES_ID='sales-ces-2027-invitation';");
const mimeExport=between('function exportMimeWithImages(item){','const oldChoose=choose;');
let wasEdited=false;
const bytes=Uint8Array.from([137,80,78,71,13,10,26,10,0,255,100]);
const b64=Buffer.from(bytes).toString('base64');
const originalHtml='<html><body><table><tr><td><img src="cid:hero@test" alt="Hero"></td></tr></table></body></html>';
const editedHtml='<html><body><p>Personalized</p><img src="data:image/png;base64,'+b64+'"></body></html>';
const context=vm.createContext({
  TextEncoder,TextDecoder,Uint8Array,atob,btoa,Date,
  byId:id=>id==='subject'?{value:'CES invitation pilot'}:id==='richEmail'?{dataset:{edited:wasEdited?'yes':''}}:null,
  currentRichHtml:()=>editedHtml
});
vm.runInContext(mimeCore+'\n'+mimeExport+'\nglobalThis.testExports={parseMime,partBytes,decodeText,decodeHeader,exportMimeWithImages}',context);
const {parseMime,partBytes,decodeText,decodeHeader,exportMimeWithImages}=context.testExports;
const source=[
  'MIME-Version: 1.0','Subject: Pilot','Content-Type: multipart/related; boundary="testboundary"','','--testboundary',
  'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',
  Buffer.from(originalHtml).toString('base64'),'--testboundary',
  'Content-Type: image/png','Content-ID: <hero@test>','Content-Transfer-Encoding: base64','',b64,'--testboundary--',''
].join('\r\n');
const sourceParts=parseMime(source);
assert.equal(sourceParts.length,2,'Should parse HTML and inline PNG');
assert.equal(decodeText(sourceParts[0]),originalHtml,'Should decode HTML');
assert.deepEqual(Array.from(partBytes(sourceParts[1].body,sourceParts[1].transfer)),Array.from(bytes),'Should decode image bytes');
const item={originalHtml,htmlBody:editedHtml,embeddedImages:[{cid:'hero@test',base64:b64,dataUrl:'data:image/png;base64,'+b64,contentType:'image/png'}]};
const exported=exportMimeWithImages(item);
assert(exported.includes('X-Unsent: 1'),'Export must be an Outlook editable draft');
const exportedParts=parseMime(exported);
assert.equal(exportedParts.length,2,'Export must include image part');
assert.equal(decodeText(exportedParts[0]),originalHtml,'Unedited export must retain original HTML verbatim');
assert.deepEqual(Array.from(partBytes(exportedParts[1].body,exportedParts[1].transfer)),Array.from(bytes),'Export must preserve original PNG bytes');
wasEdited=true;
const updated=exportMimeWithImages(item);
const updatedParts=parseMime(updated);
assert(decodeText(updatedParts[0]).includes('Personalized'),'Edited text should survive');
assert(decodeText(updatedParts[0]).includes('cid:hero@test'),'Edited HTML should link to embedded image by CID');
assert(!decodeText(updatedParts[0]).includes('data:image/png;base64,'),'Data URLs should not remain in exported HTML');
// Audience coverage: a Both email appears in Customers, Partners, Both and All.
const v2=readFileSync(new URL('../sales-partner-v2.js',import.meta.url),'utf8');
assert(v2.includes("a==='Both'&&(v==='Sales'||v==='PAM')"),'Both audience should be included in customer and partner views');
assert(v2.includes("['Both','Both']"),'Importer must offer Both as a publishing audience');
assert(v2.includes("const CES_ID='sales-ces-2027-invitation'"),'CES pilot should appear in the hub');
assert(v2.includes('loadCesApprovedLayout()'),'CES exact-layout loader must exist');
assert(v2.includes("actions.after(quickTools,sendStatus,subjectLabel,emailSubject,emailPreview,plainFields,help)"),'Contact-list personalization precedes subject and email preview');
assert(v2.includes("helpTitle.textContent='More tools and help'"),'Extra help is collapsed');
assert(v2.includes("leadSummary.textContent='Personalize from contact list'"),'Contact-list personalization must be visible in top controls');
assert(v2.includes("byId('copy').remove()"),'Unreliable formatted copy must be removed in embedded SharePoint');
assert(!v2.includes("byId('copy').hidden=false"),'Do not expose blocked clipboard action');
assert(!v2.includes("const translation=byId('translatePanel')"),'Unavailable translation must not be rendered');
const hubCode=readFileSync(new URL('../pam-email-hub.html',import.meta.url),'utf8');
assert(!hubCode.includes("window.Translator"),'Experimental browser translation code must be removed');
assert(hubCode.includes("node.nodeValue=repl(node.nodeValue)"),'CSV personalization must update rich HTML text');
assert(hubCode.includes("frame.dataset.edited='yes'"),'HTML personalizations must be included in exported EML');
assert(hubCode.includes("const doc=new DOMParser().parseFromString(selected.htmlBody"),'Each selected contact should start from approved template');
assert(v2.includes('sidebarPanel.appendChild(hint)'),'Import control stays in the sidebar, away from email preview');
assert(!v2.includes('cesRegistrationCode')&&!v2.includes('cesCodeWrap'),'Do not show separate registration-code form');
assert(v2.includes("get('embed')==='customer'"),'Provide customer-only embed mode');
assert(v2.includes("importSummary.textContent='Import an email (.eml)'"),'Visible import label must identify recommended format');
assert(v2.includes("if(!/\\.(eml|emltpl)$/i.test(file.name))"),'Unsupported import formats must be rejected');
assert(!v2.includes("const userGuidance=document.createElement('p')"),'Do not generate duplicate introductory instructions');
assert(v2.includes("'More options (plain text and alternate formats)'"),'Plain text tools belong in advanced disclosure');
assert(v2.includes("['Sales','To Customer']")&&v2.includes("['PAM','To Partner']"),'Use recipient labels');
const cesHTML=readFileSync(new URL('../email-assets/ces-2027-invitation-approved-layout.html',import.meta.url),'utf8');
assert.equal((cesHTML.match(/data:image\/png;base64,/g)||[]).length,4,'Approved invitation must include four embedded images');
assert(cesHTML.includes('cid:')===false,'CES web preview images must be inline');
assert(cesHTML.includes('ECCMc3Oo'),'CES invitation must retain the registration code from the approved original');
assert(!cesHTML.includes('[CODE]'),'The complete approved invitation should not ask for a separate code');
assert(hubMarkerPresent(),'CES must be injected after email feeds complete');
function hubMarkerPresent(){return readFileSync(new URL('../pam-email-hub.html',import.meta.url),'utf8').includes("window.__CES_PILOT__")}
const catalog=JSON.parse(readFileSync(new URL('../sales-partner-email-catalog.json',import.meta.url),'utf8'));
assert(Array.isArray(catalog.emails));
assert(catalog.emails.every(x=>x.approvalStatus==='Approved'&&['Sales','PAM','Both'].includes(x.audience)));
const hub=readFileSync(new URL('../pam-email-hub.html',import.meta.url),'utf8');
assert(hub.includes('sales-partner-v2.js')&&hub.includes('sales-partner-email-catalog.json'));
assert(hub.includes('Sales & PAM Email Template Hub'),'Hub title must be consistent');
assert(v2.includes("pageTitle.textContent='Sales & PAM Email Template Hub'"),'Interactive title must match static title');
const guide=readFileSync(new URL('../sales-partner-email-quick-start.html',import.meta.url),'utf8');
assert(guide.includes('Sales &amp; PAM Email Template Hub'),'Quick Start title must match the Hub');
assert(guide.includes('recipient')&&guide.includes('Sales and PAM teams'),'Guide should clarify sender versus recipient');
const library=readFileSync(new URL('../content-hub.html',import.meta.url),'utf8');
assert(library.includes('Sales & PAM Email: To Customer')&&library.includes('Sales & PAM Email: To Partner'));
console.log('PASS: MIME import / CID image round-trip / edited export / approval catalog / hub integration');