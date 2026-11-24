/* Sales & Partner Email Hub v2. Additive integration: existing PAM workflows remain unchanged.
   Imported MIME email and image attachments stay in the browser and are never uploaded. */
(() => {
'use strict';
const byId=id=>document.getElementById(id);
const originalMatches=matches,originalExport=downloadFormattedOutlook;
// Audience describes the recipient, not the sender. Legacy PAM catalog emails are to partners.
const audienceOf=item=>item.audience || (item.id==='resource-draft'?'Both':'PAM');
const showAudience=item=>{
 const v=byId('audienceFilter')?.value||'All';
 const a=audienceOf(item);
 return v==='All'||a===v||a==='Both'&&(v==='Sales'||v==='PAM');
};
matches=function(){return originalMatches().filter(showAudience)};
const sidebar=byId('categoryFilter');
const label=document.createElement('label');label.htmlFor='audienceFilter';label.textContent='Send email to';
const filter=document.createElement('select');filter.id='audienceFilter';filter.className='search';
[['All','All emails'],['Sales','To Customer'],['PAM','To Partner'],['Both','Both']].forEach(([value,name])=>filter.add(new Option(name,value)));
const categoryLabel=sidebar.parentElement.querySelector('label[for="categoryFilter"]');
sidebar.parentElement.insertBefore(label,categoryLabel);
sidebar.parentElement.insertBefore(filter,categoryLabel);
filter.addEventListener('change',applyFilters);
const requestedAudience=new URLSearchParams(location.search).get('audience');
if(['Sales','PAM','Both'].includes(requestedAudience))filter.value=requestedAudience;
byId('clearFilters').addEventListener('click',()=>{filter.value='All';applyFilters()});
const pageTitle=document.querySelector('header h1');if(pageTitle)pageTitle.textContent='Sales & PAM Email Template Hub';
const eyebrow=document.querySelector('header .eyebrow');if(eyebrow)eyebrow.textContent='HITACHI VANTARA / SALES & PAM ENABLEMENT';
const editorLabel=document.querySelector('.editor .kicker');if(editorLabel)editorLabel.textContent='CUSTOMER & PARTNER OUTREACH';
const guideLink=document.createElement('a');guideLink.href='https://hitachivantara.sharepoint.com/sites/To-PartnerCommunicationsFY23/SitePages/How-to-Use-Templates.aspx';guideLink.textContent='How to use email templates';guideLink.target='_blank';guideLink.rel='noopener noreferrer';guideLink.className='head-link';const navLinks=document.querySelector('header .head-actions');if(navLinks)navLinks.prepend(guideLink);
// Inside SharePoint the "Sales & PAM Email Template Hub" button links to the page already open.
if(window.parent!==window)document.querySelector('header .partner-hub-highlight')?.setAttribute('hidden','');
const hint=document.createElement('section');hint.className='panel';hint.style.cssText='margin:0 0 14px;padding:13px 17px;background:#fff';
hint.innerHTML='<p class="muted" style="margin:0 0 8px">Choose an Outlook email file: <strong>.eml (recommended)</strong>. An <strong>.emltpl</strong> may work if it contains standard email data. Files such as .oft, .msg, Word and PDF are not supported.</p><label for="richMimeImport" class="btn" style="display:inline-block;cursor:pointer">Choose .eml file</label><input id="richMimeImport" type="file" accept=".eml,.emltpl,message/rfc822" style="position:absolute;width:1px;height:1px;opacity:0"><p class="muted" style="margin:6px 0 0;font-size:12px">Include images when saving the email. Imported files are available only during this session; they are not automatically added to the shared library.</p><p id="richMimeStatus" class="muted" role="status" style="margin:8px 0 0"></p>';
document.querySelector('main').insertBefore(hint,document.querySelector('.layout'));
const audienceLabel=document.createElement('label');audienceLabel.htmlFor='importAudience';audienceLabel.textContent='Send this email to';audienceLabel.style.cssText='display:block;margin-top:14px;font-weight:700';
const importAudience=document.createElement('select');importAudience.id='importAudience';importAudience.style.cssText='display:block;padding:9px;margin:6px 0 10px;border:1px solid #aaa;max-width:260px;width:100%';
[['Sales','To Customer'],['PAM','To Partner'],['Both','Both']].forEach(([value,name])=>importAudience.add(new Option(name,value)));
hint.append(audienceLabel,importAudience);
const resourceJump=document.createElement('p');resourceJump.className='muted';resourceJump.style.cssText='margin:6px 0;font-size:12px';
resourceJump.innerHTML='<a href="./content-hub.html" target="_blank" rel="noopener noreferrer">Browse the Content Library</a> for related assets and outreach.';
hint.append(resourceJump);
// Decode RFC 2045 quoted printable and base64, keeping Windows-1252 HTML intact.
function partBytes(body,encoding){
 if(/base64/i.test(encoding))return Uint8Array.from(atob(body.replace(/\s/g,'')),x=>x.charCodeAt(0));
 if(/quoted-printable/i.test(encoding)){
  const unfolded=body.replace(/=\r?\n/g,'');
  const bytes=[];
  for(let i=0;i<unfolded.length;i++){
   if(unfolded[i]==='='&&/^[0-9a-f]{2}$/i.test(unfolded.slice(i+1,i+3))){bytes.push(parseInt(unfolded.slice(i+1,i+3),16));i+=2}
   else bytes.push(unfolded.charCodeAt(i)&255);
  }
  return new Uint8Array(bytes);
 }
 return Uint8Array.from(body,x=>x.charCodeAt(0)&255);
}
const encode64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.slice(i,i+8192));return btoa(s)};
const folded64=bytes=>(encode64(bytes).match(/.{1,76}/g)||[]).join('\r\n');
function header(headers,name){const match=headers.match(new RegExp('(?:^|\\n)'+name+':\\s*([^\\n]*(?:\\n[ \\t]+[^\\n]*)*)','i'));return match?match[1].replace(/\n[ \t]+/g,' ').trim():''}
function parseMime(raw){
 const separator=/\r?\n\r?\n/.exec(raw);if(!separator)return [];
 const h=raw.slice(0,separator.index).replace(/\r\n/g,'\n');
 const body=raw.slice(separator.index+separator[0].length);
 const ct=header(h,'Content-Type');
 const bm=/boundary\s*=\s*(?:"([^"]+)"|([^;\s]+))/i.exec(ct);
 if(/^multipart\//i.test(ct)&&bm){
  const delim='--'+(bm[1]||bm[2]);
  return body.split(delim).slice(1).filter(p=>!p.trimStart().startsWith('--')).flatMap(p=>parseMime(p.replace(/^\r?\n/,'').replace(/\r?\n$/,'')));
 }
 return [{headers:h,body,contentType:ct,transfer:header(h,'Content-Transfer-Encoding'),cid:header(h,'Content-ID').replace(/[<>]/g,''),charset:(/charset\s*=\s*"?([^";\s]+)/i.exec(ct)||[])[1]||'utf-8'}];
}
function decodeText(part){
 const bytes=partBytes(part.body,part.transfer);
 try{return new TextDecoder(part.charset).decode(bytes)}catch{return new TextDecoder('utf-8').decode(bytes)}
}
function decodeHeader(value){
 return value.replace(/=\?([^?]+)\?([bq])\?([^?]+)\?=/gi,(_,cs,kind,payload)=>{
  try{
   const bytes=kind.toLowerCase()==='b'?Uint8Array.from(atob(payload),c=>c.charCodeAt(0)):partBytes(payload.replace(/_/g,' '),'quoted-printable');
   return new TextDecoder(cs).decode(bytes);
  }catch{return payload}
 }).replace(/\r?\n[ \t]+/g,' ');
}
// Always-visible CES pilot listing. Actual invitation payload is imported from an approved file,
// never published to this public GitHub Pages repository.
const CES_ID='sales-ces-2027-invitation';
const cesPilot={
 id:CES_ID,title:'Hitachi at CES 2027 | Customer invitation',
 subject:'You’re invited: Hitachi at CES 2027 | January 6–9, Las Vegas',
 body:'CES 2027 | January 6–9 | Las Vegas Convention Center, North Hall, Booth 11116.\n\nSelect Import approved CES invitation to load the complete branded email, including images, links, registration instructions, and meeting call-to-action. Do not send this placeholder.',
 audience:'Sales',category:'Event invitation',region:'Global',
 objective:'Customer and prospect invitation',status:'Import approved .EML to activate',
 addedDate:'2026-11-23',requiresImport:true
};
window.__CES_PILOT__=cesPilot;
async function loadCesApprovedLayout(){
 try{
  const resp=await fetch('./email-assets/ces-2027-invitation-approved-layout.html',{cache:'no-store'});
  if(!resp.ok)throw Error('HTTP '+resp.status);
  const html=await resp.text();
  const documentHtml=new DOMParser().parseFromString(html,'text/html');
  const imgs=[...documentHtml.querySelectorAll('img[src^="data:image/"]')];
  if(imgs.length!==4)throw Error('Expected all four original invitation images; found '+imgs.length);
  const assets=imgs.map((img,index)=>{
   const dataUrl=img.getAttribute('src');
   const m=/^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
   if(!m)throw Error('Unsupported image '+(index+1));
   const cid='ces-2027-embedded-'+(index+1)+'@hitachi';
   return {cid,contentType:m[1],base64:m[2],dataUrl};
  });
  cesPilot.htmlBody=html;
  cesPilot.embeddedImages=assets;
  cesPilot.originalHtml=assets.reduce((text,img)=>text.replaceAll(img.dataUrl,'cid:'+img.cid),html);
  cesPilot.requiresImport=false;
  cesPilot.status='Branded invitation ready';
  if(selected?.id===CES_ID){choose(cesPilot)}
  else if(items.some(x=>x.id===CES_ID))render();
 }catch(error){
  byId('richMimeStatus').textContent='CES preview could not load: '+String(error.message||error)+'. Import the corrected .EML to load the exact invitation.';
 }
}
loadCesApprovedLayout();
const importAction=document.createElement('button');
importAction.type='button';importAction.className='btn primary';
importAction.id='importSelectedInvitation';
importAction.textContent='Import approved CES invitation (.eml)';
importAction.style.cssText='margin:10px 0;display:none';
byId('edit').insertBefore(importAction,byId('edit').firstChild);
importAction.addEventListener('click',()=>byId('richMimeImport').click());
const pendingNote=document.createElement('p');pendingNote.id='pendingRichSource';
pendingNote.setAttribute('role','status');pendingNote.className='muted';
pendingNote.style.cssText='font-size:13px;display:none';
pendingNote.textContent='The formatted invitation is loading. If it does not appear, select Import invitation to use a saved copy.';
importAction.after(pendingNote);
const previousChoose=choose;
choose=function(item){previousChoose(item);const blocked=!!item.requiresImport;
 importAction.style.display=blocked?'inline-block':'none';
 pendingNote.style.display=blocked?'block':'none';
 byId('eml').disabled=blocked;
 if(blocked)byId('outlookStatus').textContent='Import the approved CES EML before exporting. The placeholder is not a sendable email.';
 if(item===cesPilot&&!blocked)byId('outlookStatus').textContent='';
};
const imported=new Map();
byId('richMimeImport').addEventListener('change',async event=>{
 const status=byId('richMimeStatus');
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(file.size>8*1024*1024)throw Error('Please choose a file smaller than 8 MB.');
  if(!/\.(eml|emltpl)$/i.test(file.name))throw Error('Use an Outlook email file (.eml). Word, PDF, .msg and .oft files cannot be imported.');
  // Latin-1 conversion preserves each byte while MIME parts are parsed.
  const bytes=new Uint8Array(await file.arrayBuffer());
  const raw=Array.from({length:Math.ceil(bytes.length/8192)},(_,k)=>String.fromCharCode(...bytes.slice(k*8192,(k+1)*8192))).join('');
  const first=raw.split(/\r?\n\r?\n/,1)[0].replace(/\r\n/g,'\n');
  const parts=parseMime(raw);
  const htmlPart=parts.find(p=>/^text\/html\b/i.test(p.contentType));
  if(!htmlPart)throw Error('This file does not contain a formatted email. Save or export the original email as .eml, including its images, then try again.');
  const originalHtml=decodeText(htmlPart);
  const images=parts.filter(p=>/^image\/(png|jpeg|gif|webp)\b/i.test(p.contentType)&&p.cid).map(p=>{
   const contentType=p.contentType.split(';')[0].trim().toLowerCase();
   const data=encode64(partBytes(p.body,p.transfer));
   return {cid:p.cid,contentType,base64:data,dataUrl:'data:'+contentType+';base64,'+data};
  });
  let preview=originalHtml;
  for(const im of images)preview=preview.replaceAll('cid:'+im.cid,im.dataUrl);
  preview=fullPreservedEmail(preview); // safe preview, while exact original HTML is kept for export
  const subject=decodeHeader(header(first,'Subject'))||'Branded email invitation';
  const isCES=/\bCES\s*2027\b/i.test(subject);
  const item={id:isCES?CES_ID:'imported-rich-'+Date.now(),title:isCES?cesPilot.title:subject,subject,body:(parts.find(p=>/^text\/plain\b/i.test(p.contentType))?decodeText(parts.find(p=>/^text\/plain\b/i.test(p.contentType))):'').trim(),htmlBody:preview,category:'Event Invitation',region:'Global',audience:byId('importAudience').value,objective:'Event invitation',status:'Branded invitation loaded locally',addedDate:new Date().toISOString(),embeddedImages:images,originalHtml};
  imported.set(item.id,item);const oldIndex=items.findIndex(x=>x.id===item.id);if(oldIndex>=0)items.splice(oldIndex,1);items.unshift(item);choose(item);
  filter.value=item.audience==='Both'?'All':item.audience;byId('categoryFilter').value='';byId('regionFilter').value='';byId('search').value='';render();
  status.textContent='Imported '+file.name+' with '+images.length+' embedded image(s). Review the preview and links, then export the formatted .EML. This template is available only in this browser session.';
 }catch(e){status.textContent='Could not import invitation: '+String(e.message||e)}
 event.target.value='';
});
// Preserve original CID image references for MIME packaging, even after editing in the iframe.
function exportMimeWithImages(item){
 const subject=byId('subject').value.replace(/[\r\n]/g,' ').trim();
 let html=byId('richEmail').dataset.edited?(currentRichHtml()||item.htmlBody):item.originalHtml;
 for(const im of item.embeddedImages)html=html.split(im.dataUrl).join('cid:'+im.cid);
 // For exact visual fidelity, do not add the standard navigation header/footer to imported invitations.
 const related='=_RichImages_'+Date.now();
 const utf8=new TextEncoder();
 const lines=['MIME-Version: 1.0','X-Unsent: 1',...(selectedContactEmail()?['To: '+selectedContactEmail()]:[]),'Subject: =?UTF-8?B?'+encode64(utf8.encode(subject))+'?=','Content-Type: multipart/related; boundary="'+related+'"','','--'+related,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',folded64(utf8.encode(html))];
 for(const img of item.embeddedImages){
  lines.push('--'+related,'Content-Type: '+img.contentType,'Content-Transfer-Encoding: base64','Content-ID: <'+img.cid+'>','Content-Disposition: inline','',''+(img.base64.match(/.{1,76}/g)||[]).join('\r\n'));
 }
 lines.push('--'+related+'--','');
 return lines.join('\r\n');
}
const oldChoose=choose;
choose=function(item){oldChoose(item);outlookComposeUrls();byId('eml').textContent='Download formatted Outlook email';};
downloadFormattedOutlook=function(){
 if(!selected?.embeddedImages?.length)return originalExport();
 const blob=exportMimeWithImages(selected);
 download(blob,filename()+'.eml','message/rfc822');
 byId('outlookStatus').textContent='Downloaded a multipart Outlook email with '+selected.embeddedImages.length+' original embedded CID images. Open it as a draft and check the layout and links in Outlook before sending.';
};
byId('eml').onclick=()=>downloadFormattedOutlook();
byId('richMimeImport').setAttribute('aria-label','Import a formatted EML or EMLTPL invitation');

// Import is optional; keep it out of the main template-selection experience.
const importDisclosure=document.createElement('details');
importDisclosure.id='importEmailDisclosure';
const importSummary=document.createElement('summary');
importSummary.textContent='Import an email (.eml)';
importSummary.style.cssText='cursor:pointer;font-weight:700;color:#a00';
while(hint.firstChild)importDisclosure.appendChild(hint.firstChild);
importDisclosure.prepend(importSummary);
hint.appendChild(importDisclosure);
hint.style.cssText='margin:12px 0 0;padding:10px;background:#fff';

// Keep the main actions simple. Plain-text and compatibility exports remain available
// under a collapsed menu rather than next to the recommended formatted actions.
const actions=byId('eml').closest('.actions');
const advanced=document.createElement('details');
advanced.id='advancedEmailOptions';
advanced.className='advanced-email-options';
advanced.style.cssText='width:100%;padding:8px 10px;border:1px solid #dfe1e5;border-radius:4px;background:#fafafa';
const summary=document.createElement('summary');
summary.textContent='More options (plain text and alternate formats)';
summary.style.cssText='cursor:pointer;font-size:12px;font-weight:600;color:#555';
const advancedButtons=document.createElement('div');
advancedButtons.className='actions';
advancedButtons.style.cssText='margin:10px 0 2px;gap:8px';
for(const id of ['outlookWeb','defaultMail','copyEmail','word','macTemplate','macHtml']){
 const btn=byId(id);
 if(btn)advancedButtons.appendChild(btn);
}
advanced.append(summary,advancedButtons);
actions.appendChild(advanced);
byId('eml').textContent='Download formatted Outlook email';
// SharePoint iframes can block navigator.clipboard. Try an actual rich HTML
// selection/copy before offering a full-size browser-tab fallback.
const formattedCopyButton=byId('copy');
formattedCopyButton.hidden=false;
formattedCopyButton.textContent='Copy email body for Outlook';
formattedCopyButton.title='Copy the formatted message, or open it in a separate tab if your browser restricts copying';
formattedCopyButton.classList.remove('primary');

// Sending happens in the employee's existing Outlook account. This app does
// not authenticate to Microsoft 365 and does not send mail.
const openOutlookWeb=document.createElement('a');
openOutlookWeb.id='openOutlookWeb';
openOutlookWeb.className='btn';
openOutlookWeb.textContent='Open Outlook (web)';
openOutlookWeb.target='_blank';
openOutlookWeb.rel='noopener noreferrer';
openOutlookWeb.title='Open a new Outlook web draft. After copying, paste the formatted email into the message body.';
openOutlookWeb.style.cssText='display:inline-flex;align-items:center;text-decoration:none';
const openDesktopEmail=document.createElement('a');
openDesktopEmail.id='openDesktopEmail';
openDesktopEmail.className='btn';
openDesktopEmail.textContent='Open desktop email app';
openDesktopEmail.title='Open your default installed email app with a blank message and the subject filled in';
openDesktopEmail.style.cssText='display:inline-flex;align-items:center;text-decoration:none';
function outlookComposeUrls(){
 const subject=byId('subject').value.trim();
 const recipient=selectedContactEmail();
 openOutlookWeb.href='https://outlook.office.com/mail/deeplink/compose?subject='+encodeURIComponent(subject)+(recipient?'&to='+encodeURIComponent(recipient):'');
 openDesktopEmail.href='mailto:'+encodeURIComponent(recipient)+'?subject='+encodeURIComponent(subject);
}
outlookComposeUrls();
byId('subject').addEventListener('input',outlookComposeUrls);
byId('leadSelect').addEventListener('change',outlookComposeUrls);
for(const action of [openOutlookWeb,openDesktopEmail])action.addEventListener('click',outlookComposeUrls);
actions.insertBefore(openOutlookWeb,byId('reset'));
actions.insertBefore(openDesktopEmail,byId('reset'));
const compactHelp=document.createElement('p');
compactHelp.id='emailActionHelp';
compactHelp.className='muted';
compactHelp.style.cssText='margin:3px 0 9px;font-size:12px;line-height:1.4';
compactHelp.textContent='Download the email and open the file in Outlook, or choose Copy email body for Outlook to copy the message body. Then open Outlook below, paste above your signature (Ctrl+V or Command+V), add recipients, review and send.';

function safeRichDocument(){
 const source=selected?.htmlBody ? (currentRichHtml()||selected.htmlBody) : linkedEmailHtml();
 const parsed=new DOMParser().parseFromString(source,'text/html');
 parsed.querySelectorAll('script,iframe,object,embed,form,meta[http-equiv="refresh"]').forEach(el=>el.remove());
 parsed.querySelectorAll('*').forEach(el=>{
  for(const attr of [...el.attributes]){
   if(/^on/i.test(attr.name)||/^(?:javascript|data:text\/html)/i.test(attr.value.trim()) && /^(?:href|src)$/i.test(attr.name))el.removeAttribute(attr.name);
  }
 });
 return parsed;
}
function browserSelectAndCopy(documentRef,node){
 const range=documentRef.createRange();range.selectNodeContents(node);
 const selection=documentRef.defaultView.getSelection();
 selection.removeAllRanges();selection.addRange(range);
 let success=false;
 try{success=!!documentRef.execCommand('copy')}catch{}
 selection.removeAllRanges();
 return success;
}
function copyFormattedFallback(){
 const doc=safeRichDocument();
 const html=doc.documentElement.outerHTML;
 const popup=window.open('','_blank');
 if(!popup){
  const richFrame=byId('richEmail');
  try{
   const richDoc=richFrame.contentDocument;
   const range=richDoc.createRange();range.selectNodeContents(richDoc.body);
   const selection=richFrame.contentWindow.getSelection();
   selection.removeAllRanges();selection.addRange(range);
   richFrame.contentWindow.focus();
   byId('outlookStatus').textContent='Email selected. Press Ctrl+C on Windows or Command+C on Mac, then paste into Outlook.';
  }catch{
   byId('outlookStatus').textContent='SharePoint prevented copying. Download the formatted Outlook email instead.';
  }
  return;
 }
 popup.document.open();popup.document.write(html);popup.document.close();
 const bar=popup.document.createElement('div');
 bar.style.cssText='position:sticky;top:0;z-index:9999;background:#fff;color:#222;padding:12px;border-bottom:2px solid #d20000;font:14px Arial';
 const copy=popup.document.createElement('button');
 copy.textContent='Copy email';
 copy.style.cssText='background:#c00;color:#fff;border:0;padding:10px 14px;font-weight:700;cursor:pointer;margin-right:12px';
 const info=popup.document.createElement('span');
 info.textContent='If copying is blocked, select the email below and press Ctrl+C (Windows) or Command+C (Mac).';
 const outlookLink=popup.document.createElement('a');
 outlookComposeUrls();
 outlookLink.href=openOutlookWeb.href;
 outlookLink.target='_blank';outlookLink.rel='noopener noreferrer';
 outlookLink.textContent='Open Outlook (web)';
 outlookLink.style.cssText='display:inline-block;background:#f6f6f6;color:#333;text-decoration:none;padding:9px 12px;border:1px solid #aaa;margin-right:10px';
 bar.append(copy,outlookLink,info);
 const wrapper=popup.document.createElement('div');
 wrapper.style.cssText='padding:12px;max-width:1000px;margin:0 auto';
 const original=[...popup.document.body.childNodes];
 original.forEach(n=>wrapper.appendChild(n));
 popup.document.body.append(bar,wrapper);
 copy.onclick=()=>{
  if(browserSelectAndCopy(popup.document,wrapper))info.textContent='Copied. Paste into an Outlook message and check the images.';
  else{const range=popup.document.createRange();range.selectNodeContents(wrapper);popup.getSelection().removeAllRanges();popup.getSelection().addRange(range);info.textContent='Email selected. Press Ctrl+C or Command+C, then paste into Outlook.';}
 };
 popup.focus();
 byId('outlookStatus').textContent='Opened a browser tab with the email and an Open Outlook link. Copy there, then paste into Outlook and review.';
}
formattedCopyButton.onclick=async()=>{
 if(!selected){byId('outlookStatus').textContent='Select an email first.';return}
 const doc=safeRichDocument();
 const html=doc.documentElement.outerHTML;
 let copied=false;
 // execCommand is a synchronous copy method that may still be allowed where the
 // asynchronous Clipboard API is blocked by an embedding permissions policy.
 const temp=document.createElement('div');
 temp.contentEditable='true';
 temp.style.cssText='position:fixed;left:-10000px;top:0;opacity:0;pointer-events:none';
 temp.innerHTML=doc.body.innerHTML;
 document.body.appendChild(temp);
 copied=browserSelectAndCopy(document,temp);
 temp.remove();
 if(copied){byId('outlookStatus').textContent='Formatted email copied. Next, choose Open Outlook (web) or Open desktop email app, click in the message and paste (Ctrl+V / Command+V). Review before sending.';return}
 copyFormattedFallback();
};
byId('reset').textContent='Reset';
// Email-first editor: prioritize actual content rather than repeating help above it.
const emailEditor=byId('edit');
const subjectLabel=emailEditor.querySelector('label[for="subject"]');
const emailSubject=byId('subject');
const emailPreview=byId('richEmail');
const plainFields=byId('plainEmailFields');
const sendStatus=byId('outlookStatus');
const help=document.createElement('details');
help.id='emailHelp';
help.className='email-secondary';
help.style.cssText='margin:12px 0;padding:10px 12px;border:1px solid #e4e4e7;border-radius:4px;background:#fafafa';
const helpTitle=document.createElement('summary');
helpTitle.textContent='More tools and help';
helpTitle.style.cssText='font-size:12px;font-weight:700;cursor:pointer;color:#555';
help.appendChild(helpTitle);
const helpContent=document.createElement('div');
helpContent.style.cssText='padding-top:8px';
const notes=[...emailEditor.querySelectorAll(':scope > p.note')].filter(n=>n!==sendStatus);
const briefIntro=emailEditor.querySelector('#templateMetadata + p.muted');
const meta=byId('templateMetadata');
const previewNote=byId('richEmailNote');
const leadAnchor=byId('leadPersonalizationLink');
const leadPanel=byId('leadPersonalization');
const leadTools=byId('jumpToLeads');
for(const n of [meta,briefIntro,previewNote,advanced,...notes])if(n)helpContent.appendChild(n);
if(leadAnchor)leadAnchor.remove();
if(leadTools)leadTools.remove();
help.appendChild(helpContent);


const quickTools=document.createElement('div');
quickTools.id='personalizationTools';
quickTools.style.cssText='display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;margin:0 0 9px';
if(leadPanel){
 const leadDisclosure=document.createElement('details');
 leadDisclosure.id='contactPersonalizeOptions';
 leadDisclosure.style.cssText='flex:1 1 250px;margin:0;padding:8px 10px;border:1px solid #dedee2;border-radius:4px;background:#fafafa';
 const leadSummary=document.createElement('summary');
 leadSummary.textContent='Personalize from contact list';
 leadSummary.style.cssText='cursor:pointer;font-weight:600;color:#444';
 leadDisclosure.appendChild(leadSummary);
 leadPanel.style.cssText='padding:8px 0 0;margin:0;border:0;background:transparent';
 const leadIntro=leadPanel.querySelector('p.muted');
 if(leadIntro)leadIntro.textContent='Upload a CSV with columns such as First Name, Company, Email, Your Name. Select one contact to fill matching [placeholders] in the subject and email. Review before sending.';
 const leadButton=byId('csvTemplate');
 if(leadButton)leadButton.textContent='Download sample CSV';
 leadDisclosure.appendChild(leadPanel);

 const prepareRow=document.createElement('div');
 prepareRow.style.cssText='margin:9px 0 0;display:flex;gap:7px;align-items:center;flex-wrap:wrap';
 const prepareButton=document.createElement('button');
 prepareButton.type='button';prepareButton.id='prepareContactEmail';prepareButton.className='btn primary';
 prepareButton.textContent='Prepare Outlook email for this contact';
 const recipientInfo=document.createElement('span');
 recipientInfo.id='recipientDraftInfo';recipientInfo.className='muted';
 recipientInfo.style.cssText='font-size:12px';
 prepareRow.append(prepareButton,recipientInfo);
 leadPanel.appendChild(prepareRow);
 const refreshRecipient=()=>{
  const value=byId('leadSelect').value;
  const contact=value===''?null:leads[Number(value)];
  prepareButton.disabled=!contact||!selectedContactEmail();
  recipientInfo.textContent=contact?(selectedContactEmail()?'To: '+selectedContactEmail():'Missing valid Email in CSV'):'Select one contact first';
 };
 leadPanel.querySelector('#leadSelect').addEventListener('change',refreshRecipient);
 leadPanel.querySelector('#leadFile').addEventListener('change',()=>{prepareButton.disabled=true;recipientInfo.textContent='Choose a contact after loading the file';});
 prepareButton.disabled=true;
 prepareButton.onclick=()=>{
  const destination=selectedContactEmail();
  if(!destination){byId('leadStatus').textContent='Select a contact with a valid Email address in your CSV.';return}
  downloadFormattedOutlook();
  byId('leadStatus').textContent='Prepared an Outlook email addressed to '+destination+'. Open the downloaded draft, review the layout and recipient, then click Send in Outlook.';
 };

 quickTools.appendChild(leadDisclosure);
}
// Flow: 1. choose (sidebar), 2. review or customize, 3. send. A shortcut at the top of
// step 2 jumps straight to sending for PAMs who don't need to edit.
const editHeading=document.createElement('h3');
editHeading.textContent='2. Review or customize your email';
const editIntro=document.createElement('div');
editIntro.className='email-edit-instructions';
const instructionText=document.createElement('p');
instructionText.textContent='Click in the email to edit the subject or message if needed. Your changes are included when you send it in step 3.';
const sendHeading=document.createElement('h3');
sendHeading.id='sendStep';
sendHeading.textContent='3. Send your email in Outlook';
const jumpToSend=document.createElement('a');
jumpToSend.href='#sendStep';jumpToSend.className='jump-to-send';
jumpToSend.textContent='Ready to send? Go to step 3 ↓';
jumpToSend.addEventListener('click',e=>{e.preventDefault();sendHeading.scrollIntoView({behavior:'smooth',block:'start'})});
editIntro.append(instructionText,jumpToSend);
// Contact-list personalization creates an addressed Outlook draft, so it belongs with sending.
const leadSummaryEl=quickTools.querySelector('#contactPersonalizeOptions > summary');
if(leadSummaryEl)leadSummaryEl.textContent='Or send to one contact from your list (CSV)';
quickTools.style.margin='4px 0 10px';
// The share link sits with the send actions so it always copies the email currently selected.
const secondaryActions=document.createElement('div');
secondaryActions.className='secondary-actions';
secondaryActions.append(byId('reset'));
const shareButton=byId('shareLink');
if(shareButton){shareButton.textContent='Copy link to this email';shareButton.title='Copy a link that opens this exact email';secondaryActions.appendChild(shareButton)}
const internalLinks=byId('internalTemplateLinks');
internalLinks?.querySelector(':scope > p')?.remove();
if(internalLinks&&!internalLinks.querySelector('details,form,button'))internalLinks.hidden=true;
emailEditor.append(editHeading,editIntro,subjectLabel,emailSubject,emailPreview,plainFields,sendHeading,compactHelp,actions,sendStatus,quickTools,secondaryActions,help,internalLinks);
const editorStyle=document.createElement('style');
editorStyle.textContent=[
 '.email-edit-instructions{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin:0 0 12px}',
 '.email-edit-instructions p{flex:1 1 320px;min-width:0;margin:0}',
 '.email-edit-instructions a{display:inline-block;flex:none;max-width:100%;box-sizing:border-box}',
 '#edit > .actions{margin:5px 0 9px!important;gap:8px!important;align-items:stretch}',
 '[hidden]{display:none!important}',
 '#edit > .actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))}',
 '@media(max-width:560px){#edit > .actions{grid-template-columns:1fr}}',
 '#edit > .actions > .btn{display:flex;align-items:center;justify-content:center;text-align:center;min-height:42px;padding:9px 14px;font-size:13px;line-height:1.2;border-radius:3px}',
 '.secondary-actions{display:flex;gap:20px;align-items:center;margin:0 0 12px}',
 '.jump-to-send{flex:none;color:#a00;font-size:12px;font-weight:700;text-decoration:underline;text-underline-offset:3px}',
 '#sendStep{scroll-margin-top:12px;margin-top:22px;padding-top:16px;border-top:1px solid #e4e4e7}',
 '.secondary-actions .btn{background:none;border:0;padding:0;color:#a00;text-decoration:underline;text-underline-offset:3px;font-weight:600;font-size:12px}',
 '.secondary-actions .btn:hover{color:#700}',
 'header .head-actions .head-link{display:inline-flex;align-items:center;min-height:36px}',
 '#edit > .actions > .btn.primary{font-weight:700}',
 '#outlookStatus:empty{display:none!important}',
 '#outlookStatus:not(:empty){margin:6px 0!important;padding:6px 8px!important;font-size:12px}',
 '#edit > label[for="subject"]{display:block;margin:8px 0 4px}',
 '#edit > #subject{margin:0 0 8px!important}',
 '#richEmail{margin:4px 0 8px!important}',
 '#edit > .email-secondary{margin-top:10px}',
 '#edit > .email-secondary .note{font-size:12px}'
].join('\n');
document.head.appendChild(editorStyle);
const contribution=document.querySelector('.submission-section');
const jump=document.querySelector('.contribute-jump');
if(contribution&&jump)contribution.before(jump);
const sidebarPanel=document.querySelector('.layout > aside');
if(sidebarPanel)sidebarPanel.appendChild(hint);

// For SharePoint: a compact, customer-only view, with locked recipient filter.
const embedCustomer=new URLSearchParams(location.search).get('embed')==='customer';
if(embedCustomer){
 filter.value='Sales';
 byId('clearFilters').addEventListener('click',()=>{filter.value='Sales';applyFilters()});
 filter.disabled=true;
 label.hidden=true;
 filter.hidden=true;
 hint.hidden=true;
 const css=document.createElement('style');
 css.textContent='header,#contentLibraryInvite,.contribute-jump,.submission-section,.gcrh-shared-footer,.top{display:none!important}main{margin:0 auto;padding:8px;max-width:1200px}.layout{grid-template-columns:minmax(225px,280px) minmax(0,1fr);gap:12px}.side h2{font-size:16px}.editor{min-width:0}body{background:white}@media(max-width:700px){.layout{grid-template-columns:1fr}}';
 document.head.append(css);
 const requested=new URL(location.href);
 requested.searchParams.set('audience','Sales');
 history.replaceState(null,'',requested.pathname+requested.search+requested.hash);
}

// Existing plain-text emails stay with the previous renderer/exporter.
})();
