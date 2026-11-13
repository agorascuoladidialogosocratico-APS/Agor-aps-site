import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

// Editorial media are original vector drawings; no stock photos or third-party icons.
const series=[
{slug:'intelligenza-artigianale-ai-e-liberta-di-giudizio',title:"L'AI risponde. Ma chi decide?",theme:'INTELLIGENZA ARTIGIANALE',accent:'#e7bd83',bg:'#193b4a',art:'ai',cards:[
["L'AI sa rispondere","Ma una risposta rapida non è automaticamente una comprensione."],
["1. Chi parla?","Un tono sicuro non basta. Controlliamo le fonti e le prove."],
["2. Che cosa manca?","Ogni risposta seleziona: cerchiamo obiezioni e prospettive diverse."],
["3. Chi decide?","La responsabilità delle nostre scelte non appartiene a un algoritmo."],
["Usa l'AI. Tieni il giudizio.","L'Intelligenza Artigianale comincia da una domanda."]]},
{slug:'algoritmi-feed-e-democrazia-chi-decide-cosa-vediamo',title:'Il feed è la nuova piazza?',theme:'DEMOCRAZIA DIGITALE',accent:'#b3d6bd',bg:'#1e464b',art:'feed',cards:[
["Chi decide cosa vedi?","La selezione precede spesso la nostra scelta di informazione."],
["Il feed non è neutro","Non tutto ciò che compare è la cosa più importante."],
["Reazione o giudizio?","Sospendere una risposta può essere un atto di libertà."],
["Quale voce manca?","Una comunità ha bisogno anche di differenze comprensibili."],
["La piazza inizia dalle domande","La democrazia non è uno scorrimento infinito."]]},
{slug:'inclusione-non-basta-invitare-bisogna-rendere-possibile',title:'Invitati non significa inclusi.',theme:'INCLUSIONE REALE',accent:'#e9b6a4',bg:'#51404d',art:'bridge',cards:[
["La porta è aperta. E allora?","Un invito non cancella automaticamente le barriere."],
["Le barriere invisibili","Orari, costi, distanze, linguaggio e fiducia contano."],
["Ascolta prima di decidere","Le persone non sono soltanto categorie da raggiungere."],
["Progetta insieme","Chi partecipa deve poter cambiare il percorso."],
["Inclusione è poter incidere","Non basta esserci: bisogna poter prendere parte."]]},
{slug:'che-cosa-significa-essere-cittadini-oggi',title:'Essere cittadini è partecipare.',theme:'CITTADINANZA ATTIVA',accent:'#e8c785',bg:'#3c4055',art:'civic',cards:[
["Cittadini o spettatori?","Essere cittadini è più di una condizione sulla carta."],
["Potere «su»","Decidere per gli altri senza ascoltarne le ragioni."],
["Potere «di»","Costruire insieme capacità, regole e possibilità."],
["Dissentire è possibile","Argomentare non significa annullare la dignità dell'altro."],
["La democrazia è un verbo","Quale domanda faremo nella nostra comunità?"]]},
{slug:'viaggiare-non-basta-cambiare-sguardo-filosofia',title:'Viaggiare non basta.',theme:'FILOSOFIA DEL VIAGGIO',accent:'#a9d2d1',bg:'#314e5a',art:'travel',cards:[
["Quanti luoghi hai visto?","E quante prospettive hai davvero incontrato?"],
["Non consumare l'altro","Una persona non rappresenta da sola un intero Paese."],
["Chiedi prima di raccontare","Ascolto e consenso sono parte del viaggio."],
["Il ritorno è una domanda","Che cosa guardiamo ora in maniera diversa?"],
["Attraversa. Interroga.","Un viaggio diventa filosofico quando cambia lo sguardo."]]}
];
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const wrap=(s,max=21)=>{const words=String(s).split(/\s+/),lines=[],cur=[];for(const w of words){if(cur.length&&[...cur.join(' ')+' '+w].length>max){lines.push(cur.join(' '));cur.length=0;}cur.push(w);}if(cur.length)lines.push(cur.join(' '));return lines;};
const lines=(title,x,y,width,size,color,maxLines=4)=>{const texts=wrap(title,width);const font=texts.length>maxLines?size*.83:size;return texts.map((line,i)=>'<text x="'+x+'" y="'+(y+i*font*1.14)+'" font-size="'+font+'" fill="'+color+'" font-family="Georgia,serif" font-weight="700">'+esc(line)+'</text>').join('');};
const illustration=(kind,color)=>({
ai:'<g fill="none" stroke="'+color+'" stroke-width="11"><path d="M180 40 L180 150 L270 205 L180 260 L180 370"/><path d="M60 185 L152 185 M208 185 L318 185"/></g><circle cx="180" cy="205" r="42" fill="'+color+'"/><g fill="'+color+'"><circle cx="60" cy="185" r="20"/><circle cx="318" cy="185" r="20"/><circle cx="180" cy="40" r="20"/><circle cx="180" cy="370" r="20"/></g>',
feed:'<g fill="none" stroke="'+color+'" stroke-width="10"><rect x="48" y="68" width="280" height="262" rx="28"/><path d="M82 128 H290 M82 190 H248 M82 253 H276"/></g><g fill="'+color+'"><circle cx="278" cy="346" r="22"/><circle cx="62" cy="346" r="22"/><path d="M286 322 L341 265 L339 341Z"/></g>',
bridge:'<g fill="none" stroke="'+color+'" stroke-width="11"><path d="M24 300 Q182 32 342 300 M24 300 V345 M342 300 V345"/><path d="M38 290 H331 M72 250 V300 M132 173 V296 M235 175 V296 M295 251 V300"/></g><g fill="'+color+'"><circle cx="182" cy="265" r="21"/><path d="M163 291 L199 291 L216 356 L145 356Z"/></g>',
civic:'<g fill="none" stroke="'+color+'" stroke-width="10"><path d="M48 144 L182 48 L318 144 M72 144 H292 M72 313 H292 M43 339 H320"/><path d="M90 149 V297 M162 149 V297 M234 149 V297 M292 149 V297"/></g><circle cx="181" cy="83" r="13" fill="'+color+'"/>',
travel:'<g fill="none" stroke="'+color+'" stroke-width="10"><circle cx="185" cy="184" r="144"/><circle cx="185" cy="184" r="79"/><path d="M0 320 Q90 266 173 324 T362 322 M59 370 Q181 327 322 370"/></g><path d="M132 146 L185 91 L230 149" stroke="'+color+'" fill="none" stroke-width="12"/><circle cx="185" cy="184" r="21" fill="'+color+'"/>'
})[kind];
function document({width,height,bg,accent,theme,art,title,subtitle,step,story=false,cover=false}){
 const horizontal=width>height, margin=horizontal?70:72,headlineY=horizontal?260:story?440:410,headlineFont=horizontal?58:story?77:71;
 const symbolSize=horizontal?400:story?490:450;const symbolX=horizontal?865:width-symbolSize-30, symbolY=horizontal?135:story?820:730;
 const graphic='<g transform="translate('+symbolX+' '+symbolY+') scale('+(symbolSize/370)+')" opacity=".80">'+illustration(art,accent)+'</g>';
 const label='<text x="'+margin+'" y="'+(horizontal?126:132)+'" font-size="'+(horizontal?25:23)+'" letter-spacing="4" fill="'+accent+'" font-family="Arial,sans-serif">AGORÀ  /  MAGAZINE</text>';
 const sect='<text x="'+margin+'" y="'+(horizontal?187:235)+'" font-size="'+(horizontal?19:21)+'" letter-spacing="3" fill="#eee4d6" font-family="Arial,sans-serif">'+esc(theme)+'</text>';
 const headline=lines(title,margin,headlineY,horizontal?25:story?18:21,headlineFont,'#fffaf0',4);
 const sub=subtitle?lines(subtitle,margin,horizontal?555:story?1410:1080,story?29:horizontal?58:29,horizontal?26:story?40:31,'#f4eada',story?5:5):'';
 const footer='<line x1="'+margin+'" y1="'+(height-150)+'" x2="'+(width-margin)+'" y2="'+(height-150)+'" stroke="'+accent+'" opacity=".65" stroke-width="3"/><text x="'+margin+'" y="'+(height-94)+'" fill="#f1e7da" font-size="'+(horizontal?20:26)+'" font-family="Arial,sans-serif">Le domande aprono possibilità.</text><text x="'+(width-margin)+'" y="'+(height-94)+'" text-anchor="end" fill="'+accent+'" font-size="'+(horizontal?20:22)+'" font-family="Arial,sans-serif">'+esc(step||'Agorà APS')+'</text>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"><rect width="100%" height="100%" fill="'+bg+'"/><path d="M'+(width*.54)+' -100 Q'+(width*.75)+' '+(height*.42)+' '+(width*.6)+' '+(height+100)+'" fill="none" stroke="'+accent+'" stroke-width="5" opacity=".28"/><circle cx="'+(width*.9)+'" cy="'+(height*.16)+'" r="'+(width*.19)+'" fill="'+accent+'" opacity=".055"/>'+label+sect+headline+graphic+sub+footer+'</svg>';
}
const base='assets/magazine/contemporaneo';
for(const s of series){const dir=join(base,s.slug);mkdirSync(dir,{recursive:true});const write=(name,svg)=>writeFileSync(join(dir,name),svg,'utf8');
write('cover.svg',document({...s,width:1300,height:731,subtitle:'FILOSOFIA E VISSUTO CONTEMPORANEO',cover:true}));
s.cards.forEach(([heading,copy],i)=>write('carousel-'+String(i+1).padStart(2,'0')+'.svg',document({...s,width:1080,height:1350,title:heading,subtitle:copy,step:(i+1)+'/5'})));
write('story-01.svg',document({...s,width:1080,height:1920,title:s.cards[0][0],subtitle:s.cards[0][1],story:true,step:'01/02'}));
write('story-02.svg',document({...s,width:1080,height:1920,title:'E tu, che cosa ne pensi?',subtitle:'Una domanda per aprire il dialogo. Leggi su Agorà Magazine.',story:true,step:'02/02'}));
}
console.log('Generated '+series.length+' original covers, '+series.length*5+' carousel slides, '+series.length*2+' story slides.');
