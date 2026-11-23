/* Sales & Partner Email Hub v2. Additive integration: existing PAM workflows remain unchanged.
   Imported MIME email and image attachments stay in the browser and are never uploaded. */
(() => {
'use strict';
const byId=id=>document.getElementById(id);
const originalMatches=matches,originalExport=downloadFormattedOutlook;
const audienceOf=item=>item.audience || (item.id==='resource-draft'?'Both':'PAM');
const showAudience=item=>{
 const v=byId('audienceFilter')?.value||'All';
 return v==='All'||audienceOf(item)==='Both'||audienceOf(item)===v;
};
matches=function(){return originalMatches().filter(showAudience)};
const sidebar=byId('categoryFilter');
const label=document.createElement('label');label.htmlFor='audienceFilter';label.textContent='Audience';
const filter=document.createElement('select');filter.id='audienceFilter';filter.className='search';
[['All','All audiences'],['Sales','Sales'],['PAM','PAMs'],['Both','Both audiences']].forEach(([value,name])=>filter.add(new Option(name,value)));
sidebar.parentElement.insertBefore(label,sidebar);
sidebar.parentElement.insertBefore(filter,sidebar);
filter.addEventListener('change',applyFilters);
byId('clearFilters').addEventListener('click',()=>{filter.value='All';applyFilters()});
const pageTitle=document.querySelector('header h1');if(pageTitle)pageTitle.textContent='Sales & Partner Email Hub';
const eyebrow=document.querySelector('header .eyebrow');if(eyebrow)eyebrow.textContent='HITACHI VANTARA / SALES & PARTNER PROGRAMS';
const editorLabel=document.querySelector('.editor .kicker');if(editorLabel)editorLabel.textContent='SALES & PARTNER COMMUNICATION';
const hint=document.createElement('section');hint.className='panel';hint.style.cssText='margin:0 0 14px;padding:13px 17px;background:#fff';
hint.innerHTML='<strong>Rich-format invitations</strong><p class="muted" style="margin:5px 0">Pilot: Hitachi at CES 2027. Import the approved .EML or .EMLTPL from your computer to preview, personalize, and export an Outlook draft with its embedded images intact. The file remains on your device and is not published in this public repository.</p><label for="richMimeImport" class="btn primary" style="display:inline-block;cursor:pointer">Import branded invitation (.eml / .emltpl)</label><input id="richMimeImport" type="file" accept=".eml,.emltpl,message/rfc822" style="position:absolute;width:1px;height:1px;opacity:0"><p id="richMimeStatus" class="muted" role="status" style="margin:8px 0 0"></p>';
document.querySelector('main').insertBefore(hint,document.querySelector('.layout'));
const resourceJump=document.createElement('p');resourceJump.className='muted';resourceJump.style.cssText='margin:6px 0;font-size:12px';
resourceJump.innerHTML='<a href="./content-hub.html" target="_blank" rel="noopener noreferrer">Browse the Content Library</a> for assets to share. Approved email templates can also be opened directly with <code>?email=template-id</code>.';
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
  const item={id:'imported-rich-'+Date.now(),title:subject,subject,body:(parts.find(p=>/^text\/plain\b/i.test(p.contentType))?decodeText(parts.find(p=>/^text\/plain\b/i.test(p.contentType))):'').trim(),htmlBody:preview,category:'Event Invitation',region:'Global',audience:'Sales',objective:'Event invitation',status:'Local pilot · not published',addedDate:new Date().toISOString(),embeddedImages:images,originalHtml};
  imported.set(item.id,item);items.unshift(item);choose(item);
  filter.value='Sales';byId('categoryFilter').value='';byId('regionFilter').value='';byId('search').value='';render();
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
choose=function(item){oldChoose(item);byId('eml').textContent=item?.embeddedImages?.length?'Download Outlook email with embedded images (.eml)':'Download formatted Outlook email (.eml)';};
downloadFormattedOutlook=function(){
 if(!selected?.embeddedImages?.length)return originalExport();
 const blob=exportMimeWithImages(selected);
 download(blob,filename()+'.eml','message/rfc822');
 byId('outlookStatus').textContent='Downloaded a multipart Outlook email with '+selected.embeddedImages.length+' original embedded CID images. Open it as a draft and check the layout and links in Outlook before sending.';
};
byId('eml').onclick=()=>downloadFormattedOutlook();
byId('richMimeImport').setAttribute('aria-label','Import a formatted EML or EMLTPL invitation');
// Existing plain-text emails stay with the previous renderer/exporter.
})();