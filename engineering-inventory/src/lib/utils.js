export const LS='eim_';
export const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
export const ago=h=>new Date(Date.now()-h*3600e3).toISOString();
export const fmt=d=>d?new Date(d).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):'';
export const cfgGet=()=>{try{return JSON.parse(localStorage.getItem(LS+'cfg'))||{}}catch(e){return {}}};

export const stockOf=i=>i.quantity<=0?['out','Out of stock']:i.quantity<=i.min_stock?['low','Low']:['ok','In stock'];
export const csv=(rows,name)=>{if(!rows.length)return;const k=Object.keys(rows[0]);const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;
 const b=new Blob([k.join(',')+'\n'+rows.map(r=>k.map(x=>q(r[x])).join(',')).join('\n')],{type:'text/csv'});
 const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click()};
