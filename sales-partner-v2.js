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
const label=document.createElement('label');label.htmlFor='audienceFilter';label.textContent='Recipient audience';
const filter=document.createElement('select');filter.id='audienceFilter';filter.className='search';
[['All','All emails'],['Sales','To Customer'],['PAM','To Partner'],['Both','Both']].forEach(([value,name])=>filter.add(new Option(name,value)));
const categoryLabel=sidebar.parentElement.querySelector('label[for="categoryFilter"]');
sidebar.parentElement.insertBefore(label,categoryLabel);
sidebar.parentElement.insertBefore(filter,categoryLabel);
filter.addEventListener('change',applyFilters);
const requestedAudience=new URLSearchParams(location.search).get('audience');
if(['Sales','PAM','Both'].includes(requestedAudience))filter.value=requestedAudience;
byId('clearFilters').addEventListener('click',()=>{filter.value='All';applyFilters()});
const pageTitle=document.querySelector('header h1');if(pageTitle)pageTitle.textContent='Sales & Partner Email Hub';
const eyebrow=document.querySelector('header .eyebrow');if(eyebrow)eyebrow.textContent='HITACHI VANTARA / SALES & PARTNER PROGRAMS';
const editorLabel=document.querySelector('.editor .kicker');if(editorLabel)editorLabel.textContent='SALES & PARTNER COMMUNICATION';
const guideLink=document.createElement('a');guideLink.href='./sales-partner-email-quick-start.html';guideLink.textContent='How to use this Hub';guideLink.target='_blank';guideLink.rel='noopener noreferrer';guideLink.className='header-text-link';const navLinks=document.querySelector('header .head-actions');if(navLinks)navLinks.prepend(guideLink);
const hint=document.createElement('section');hint.className='panel';hint.style.cssText='margin:0 0 14px;padding:13px 17px;background:#fff';
hint.innerHTML='<strong>Bring your own approved email</strong><p class="muted" style="margin:5px 0">Already have a branded invitation? Import it to personalize and prepare a formatted Outlook email.</p><label for="richMimeImport" class="btn" style="display:inline-block;cursor:pointer">Import formatted invitation</label><input id="richMimeImport" type="file" accept=".eml,.emltpl,message/rfc822" style="position:absolute;width:1px;height:1px;opacity:0"><p id="richMimeStatus" class="muted" role="status" style="margin:8px 0 0"></p>';
document.querySelector('main').insertBefore(hint,document.querySelector('.layout'));
const audienceLabel=document.createElement('label');audienceLabel.htmlFor='importAudience';audienceLabel.textContent='Who is this email for?';audienceLabel.style.cssText='display:block;margin-top:14px;font-weight:700';
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
 if(item===cesPilot&&!blocked)byId('outlookStatus').textContent='The formatted invitation is ready. Personalize it and download your Outlook email.';
};
const imported=new Map();
byId('richMimeImport').addEventListener('change',async event=>{
 const status=byId('richMimeStatus');
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(file.size>8*1024*1024)throw Error('The file must be 8 MB or smaller.');
  // Latin-1 conversion preserves each byte while MIME parts are parsed.
  const bytes=new Uint8Array(await file.arrayBuffer());
  const raw=Array.from({length:Math.ceil(bytes.length/8192)},(_,k)=>String.fromCharCode(...bytes.slice(k*8192,(k+1)*8192))).join('');
  const first=raw.split(/\r?\n\r?\n/,1)[0].replace(/\r\n/g,'\n');
  const parts=parseMime(raw);
  const htmlPart=parts.find(p=>/^text\/html\b/i.test(p.contentType));
  if(!htmlPart)throw Error('No HTML invitation was found inside this email.');
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
 const lines=['MIME-Version: 1.0','X-Unsent: 1','Subject: =?UTF-8?B?'+encode64(utf8.encode(subject))+'?=','Content-Type: multipart/related; boundary="'+related+'"','','--'+related,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',folded64(utf8.encode(html))];
 for(const img of item.embeddedImages){
  lines.push('--'+related,'Content-Type: '+img.contentType,'Content-Transfer-Encoding: base64','Content-ID: <'+img.cid+'>','Content-Disposition: inline','',''+(img.base64.match(/.{1,76}/g)||[]).join('\r\n'));
 }
 lines.push('--'+related+'--','');
 return lines.join('\r\n');
}
const oldChoose=choose;
choose=function(item){oldChoose(item);byId('eml').textContent='Download formatted Outlook email';};
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
importSummary.textContent='Import another formatted invitation';
importSummary.style.cssText='cursor:pointer;font-weight:700;color:#a00';
while(hint.firstChild)importDisclosure.appendChild(hint.firstChild);
importDisclosure.prepend(importSummary);
hint.appendChild(importDisclosure);
hint.style.cssText='margin:0 0 12px;padding:11px 15px;background:#fff';

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
byId('copy').hidden=false;
byId('copy').textContent='Copy formatted email';
byId('copy').title='Paste into Outlook, then check images and spacing before sending';
byId('copy').classList.remove('primary');
byId('reset').textContent='Reset';
const userGuidance=document.createElement('p');
userGuidance.className='muted';
userGuidance.style.cssText='font-size:12px;margin:6px 0 12px';
userGuidance.textContent='For the most reliable branded layout, use Download formatted Outlook email. Open it in Outlook for Mac or Windows, personalize, check images and links, then send. Nothing sends automatically.';
actions.after(userGuidance);
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
 css.textContent='header,.contribute-jump,.submission-section,.gcrh-shared-footer,.top{display:none!important}main{margin:0 auto;padding:8px;max-width:1200px}.layout{grid-template-columns:minmax(225px,280px) minmax(0,1fr);gap:12px}.side h2{font-size:16px}.editor{min-width:0}body{background:white}@media(max-width:700px){.layout{grid-template-columns:1fr}}';
 document.head.append(css);
 const requested=new URL(location.href);
 requested.searchParams.set('audience','Sales');
 history.replaceState(null,'',requested.pathname+requested.search+requested.hash);
}

// Existing plain-text emails stay with the previous renderer/exporter.
})();