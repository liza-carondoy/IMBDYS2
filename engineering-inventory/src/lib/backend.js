import { createClient } from '@supabase/supabase-js';
import { LS, uid, ago } from './utils.js';

const seed=t=>({
 items:[
  {id:'i1',name:'Arduino Uno R3',sku:'ELE-001',category:'Electronics',quantity:24,min_stock:10,unit:'pcs',location:'Shelf A1',created_at:ago(300)},
  {id:'i2',name:'Digital Caliper 150mm',sku:'TLS-014',category:'Tools',quantity:6,min_stock:4,unit:'pcs',location:'Cabinet B2',created_at:ago(290)},
  {id:'i3',name:'M6 Hex Bolts',sku:'FAS-120',category:'Fasteners',quantity:180,min_stock:100,unit:'pcs',location:'Bin C4',created_at:ago(280)},
  {id:'i4',name:'Solder Wire 0.8mm',sku:'CON-007',category:'Consumables',quantity:3,min_stock:5,unit:'rolls',location:'Shelf A3',created_at:ago(270)},
  {id:'i5',name:'PLA Filament 1kg',sku:'CON-021',category:'Consumables',quantity:9,min_stock:4,unit:'spools',location:'Shelf D1',created_at:ago(260)},
  {id:'i6',name:'Safety Goggles',sku:'SAF-003',category:'Safety',quantity:2,min_stock:6,unit:'pcs',location:'Locker S1',created_at:ago(250)}],
 restocks:[{id:'s1',item_id:'i5',item_name:'PLA Filament 1kg',quantity:5,supplier:'MakerSupply',note:'Monthly order',created_at:ago(40)}],
 requests:[
  {id:'r1',item_id:'i6',item_name:'Safety Goggles',quantity:4,requester:'Maria Santos',department:'Mechanical Eng.',purpose:'Machine shop lab session',status:'pending',reviewer_note:null,created_at:ago(5),updated_at:ago(5)},
  {id:'r2',item_id:'i4',item_name:'Solder Wire 0.8mm',quantity:2,requester:'Jon Reyes',department:'Electronics',purpose:'Circuit board project',status:'pending',reviewer_note:null,created_at:ago(3),updated_at:ago(3)},
  {id:'r3',item_id:'i2',item_name:'Digital Caliper 150mm',quantity:1,requester:'Ana Lopez',department:'Mechanical Eng.',purpose:'Part inspection',status:'approved',reviewer_note:'Return by Friday',created_at:ago(30),updated_at:ago(26)}]
}[t]);
export const rd=t=>{try{const v=JSON.parse(localStorage.getItem(LS+t));if(v)return v}catch(e){}const s=seed(t);wr(t,s);return s};
export const wr=(t,v)=>localStorage.setItem(LS+t,JSON.stringify(v));

export function makeBackend(cfg){
 if(cfg.url&&cfg.key){
  const c=createClient(cfg.url,cfg.key);
  const ok=r=>{if(r.error)throw r.error;return r.data};
  return {mode:'supabase',
   list:async t=>ok(await c.from(t).select('*').order('created_at',{ascending:false})),
   insert:async(t,row)=>ok(await c.from(t).insert(row).select().single()),
   update:async(t,id,p)=>ok(await c.from(t).update(p).eq('id',id).select().single()),
   remove:async(t,id)=>ok(await c.from(t).delete().eq('id',id))};
 }
 return {mode:'local',
  list:async t=>[...rd(t)].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)),
  insert:async(t,row)=>{const r={id:uid(),created_at:new Date().toISOString(),...row};if(t==='requests')r.updated_at=r.created_at;wr(t,[...rd(t),r]);return r},
  update:async(t,id,p)=>{wr(t,rd(t).map(x=>x.id===id?{...x,...p}:x))},
  remove:async(t,id)=>{wr(t,rd(t).filter(x=>x.id!==id))}};
}
