/* App shell: le modifiche reali rimangono protette dagli accessi Pages CMS e Buffer. */
(()=>{'use strict';
 const install=document.querySelector('#install-button');
 let installEvent=null;
 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();installEvent=event;if(install)install.hidden=false;
 });
 install?.addEventListener('click',async()=>{
  if(!installEvent)return;
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent=null;install.hidden=true;
 });
 window.addEventListener('appinstalled',()=>{if(install)install.hidden=true;});
 if('serviceWorker' in navigator&&location.protocol==='https:'){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/editor/sw.js',{scope:'/editor/'}).catch(()=>{}));
 }
 const title=document.querySelector('#latest-article-title');
 const link=document.querySelector('#latest-article-url');
 const status=document.querySelector('#latest-status');
 fetch('/magazine/rss.xml',{cache:'no-store'}).then(async response=>{
  if(!response.ok)throw Error('rss unavailable');
  const xml=new DOMParser().parseFromString(await response.text(),'application/xml');
  if(xml.querySelector('parsererror'))return;
  const item=xml.querySelector('item');if(!item)return;
  const url=item.querySelector('link')?.textContent||'';
  if(!url.startsWith(location.origin+'/magazine/'))return;
  if(title)title.textContent=item.querySelector('title')?.textContent||'Ultimo articolo';
  if(link){link.href=url;link.textContent='Leggi l’articolo ↗';}
  if(status)status.textContent='Ultima pubblicazione';
 }).catch(()=>{});
 if(new URLSearchParams(location.search).get('azione')==='articolo'){
  const explain=document.querySelector('#install-explain');
  if(explain)explain.textContent='Per creare un articolo, apri “Scrivi un articolo” e accedi a Pages CMS con l’account GitHub dell’associazione.';
 }
})();
