import { useState, useEffect, useMemo, useCallback } from 'react';
import { uid, cfgGet } from './lib/utils.js';
import { makeBackend } from './lib/backend.js';
import Dashboard from './pages/Dashboard.jsx';
import Restock from './pages/Restock.jsx';
import Pending from './pages/Pending.jsx';
import Status from './pages/Status.jsx';
import Settings from './pages/Settings.jsx';

export default function App(){
 const [cfg,setCfg]=useState(cfgGet);
 const backend=useMemo(()=>makeBackend(cfg),[cfg]);
 const [d,setD]=useState({items:[],restocks:[],requests:[]});
 const [err,setErr]=useState(null),[busy,setBusy]=useState(true),[toasts,setToasts]=useState([]);
 const [page,setPage]=useState(location.hash.slice(1)||'dashboard');
 const toast=(m,k)=>{const id=uid();setToasts(t=>[...t,{id,m,k}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3400)};
 const load=useCallback(async()=>{setBusy(true);try{const [items,restocks,requests]=await Promise.all(['items','restocks','requests'].map(t=>backend.list(t)));setD({items,restocks,requests});setErr(null)}catch(e){setErr(e.message||String(e))}setBusy(false)},[backend]);
 useEffect(()=>{load()},[load]);
 useEffect(()=>{const h=()=>setPage(location.hash.slice(1)||'dashboard');addEventListener('hashchange',h);return()=>removeEventListener('hashchange',h)},[]);
 const run=async(fn,ok)=>{try{await fn();await load();toast(ok);return true}catch(e){toast(e.message||String(e),'err');return false}};
 const find=id=>d.items.find(i=>i.id===id);
 const a={...d,toast,reload:load,
  addItem:p=>run(()=>backend.insert('items',p),'Item added'),
  saveItem:(id,p)=>run(()=>backend.update('items',id,p),'Item updated'),
  delItem:i=>confirm(`Delete "${i.name}"? This cannot be undone.`)&&run(()=>backend.remove('items',i.id),'Item deleted'),
  restock:f=>run(async()=>{const it=find(f.item_id);await backend.insert('restocks',{...f,item_name:it.name});await backend.update('items',it.id,{quantity:it.quantity+f.quantity})},`Added ${f.quantity} to stock`),
  request:f=>run(()=>backend.insert('requests',{...f,item_name:find(f.item_id).name,status:'pending'}),'Request submitted'),
  review:(r,status,note)=>run(async()=>{
   if(status==='approved'){const it=find(r.item_id);if(!it)throw new Error('This item no longer exists');if(it.quantity<r.quantity)throw new Error(`Only ${it.quantity} ${it.unit} in stock`);await backend.update('items',it.id,{quantity:it.quantity-r.quantity})}
   await backend.update('requests',r.id,{status,reviewer_note:note||null,updated_at:new Date().toISOString()})},
   {approved:'Request approved',rejected:'Request rejected',cancelled:'Request cancelled'}[status])};
 const pend=d.requests.filter(r=>r.status==='pending').length;
 const nav=[['dashboard','Dashboard'],['restock','Restock entry'],['pending','Pending requests'],['status','Request status'],['settings','Settings']];
 const go=p=>{location.hash=p;setPage(p)};
 const Page={dashboard:Dashboard,restock:Restock,pending:Pending,status:Status}[page];
 return <div className="app">
  <aside><div className="brand"><svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="12" fill="none" stroke="#fff" strokeWidth="2"/><path d="M15 15 L22 9" stroke="#e8a317" strokeWidth="3" strokeLinecap="round"/><circle cx="15" cy="15" r="2.5" fill="#fff"/></svg><span>Engineering<br/>Inventory</span></div>
   <nav>{nav.map(([k,l])=><button key={k} className={page===k?'on':''} onClick={()=>go(k)}>{l}{k==='pending'&&pend>0&&<span className="badge">{pend}</span>}</button>)}</nav>
   <div className="mode"><span className={'dot'+(backend.mode==='supabase'?' live':'')}/>{backend.mode==='supabase'?'Supabase connected':'Local storage mode'}{busy&&<div className="sync">Syncing…</div>}</div></aside>
  <main>
   {err&&<div className="alert"><b>Could not load data.</b> {err}. {backend.mode==='supabase'&&'Check the tables and credentials in Settings.'} <button className="btn sm" onClick={()=>go('settings')}>Open settings</button></div>}
   {page==='settings'?<Settings a={a} cfg={cfg} setCfg={setCfg} backend={backend}/>:Page?<Page a={a}/>:null}
  </main>
  <div className="toasts" role="status">{toasts.map(t=><div key={t.id} className={'toast '+(t.k||'')}>{t.m}</div>)}</div></div>;
}
