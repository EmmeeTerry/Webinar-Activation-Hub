/* Shared Hub utilities. Preserve current local-date and ICS behavior. */
(function(root){
  "use strict";
  function localDay(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function todayStr(){return localDay(new Date());}
  function icsEscape(s){return (s||'').replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');}
  const api=Object.freeze({localDay,todayStr,icsEscape});
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.HubDateUtils=api;
})(typeof globalThis!=='undefined'?globalThis:this);
