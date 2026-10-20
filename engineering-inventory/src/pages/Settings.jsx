import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LS, csv } from '../lib/utils.js';
import { rd } from '../lib/backend.js';
import { SQL } from '../lib/sql.js';

export default function Settings({a,cfg,setCfg,backend}){
 const [url,setUrl]=useState(cfg.url||''),[key,setKey]=useState(cfg.key||''),[show,setShow]=useState(false);
 const [msg,setMsg]=useState(null),[busy,setBusy]=useState(false);
 const clean=()=>({url:url.trim().replace(/\/+$/,''),key:key.trim()});
 const test=async()=>{const c=clean();if(!c.url||!c.key){setMsg({k:'',t:'Enter both the project URL and the anon key.'});return}
  if(!/^https:\/\/.+\.supabase\.(co|in)$/.test(c.url)){setMsg({k:'',t:'The URL should look like https://your-project.supabase.co'});return}
  setBusy(true);try{const cl=createClient(c.url,c.key);const {error}=await cl.from('items').select('id').limit(1);
   if(!error)setMsg({k:'good',t:'Connected. All tables were found.'});
   else if(error.code==='42P01'||error.code==='PGRST205'||/not find|does not exist/i.test(error.message))setMsg({k:'info',t:'Connected, but the tables are missing. Run the SQL below in Supabase, then test again.'});
   else setMsg({k:'',t:'Connection failed: '+error.message})}
  catch(e){setMsg({k:'',t:'Connection failed: '+e.message})}setBusy(false)};
 const save=()=>{const c=clean();if(!c.url||!c.key){setMsg({k:'',t:'Enter both the project URL and the anon key.'});return}
  localStorage.setItem(LS+'cfg',JSON.stringify(c));setCfg(c);a.toast('Supabase credentials saved')};
 const off=()=>{localStorage.removeItem(LS+'cfg');setCfg({});setUrl('');setKey('');setMsg(null);a.toast('Disconnected. Using local data')};
 const copy=async()=>{try{await navigator.clipboard.writeText(SQL);a.toast('SQL copied')}catch(e){a.toast('Select the SQL and copy it manually','err')}};
 const upload=async()=>{if(!confirm('Copy the data stored in this browser into Supabase?'))return;setBusy(true);
  try{const map={};for(const i of rd('items')){const {id,created_at,...p}=i;map[id]=(await backend.insert('items',p)).id}
   for(const r of rd('restocks')){const {id,created_at,...p}=r;await backend.insert('restocks',{...p,item_id:map[p.item_id]||null})}
   for(const r of rd('requests')){const {id,created_at,updated_at,...p}=r;await backend.insert('requests',{...p,item_id:map[p.item_id]||null})}
   await a.reload();a.toast('Local data uploaded to Supabase')}catch(e){a.toast('Upload failed: '+e.message,'err')}setBusy(false)};
 const reset=()=>{if(!confirm('Erase local data and restore the sample items?'))return;['items','restocks','requests'].forEach(t=>localStorage.removeItem(LS+t));a.reload();a.toast('Local data reset')};
 const live=backend.mode==='supabase';
 return <>
  <div className="head"><div><h1>Settings</h1><p>Connect your Supabase project. Without credentials the app stores data in this browser.</p></div></div>
  <div className="grid g2">
   <div className="card"><h2 style={{marginBottom:10}}>Supabase credentials</h2>
    <label>Project URL<input placeholder="https://abcdxyz.supabase.co" value={url} onChange={e=>setUrl(e.target.value)} autoComplete="off"/></label>
    <label>Anon public key<input type={show?'text':'password'} value={key} onChange={e=>setKey(e.target.value)} autoComplete="off"/></label>
    <label style={{display:'flex',gap:8,alignItems:'center',fontWeight:400}}><input type="checkbox" style={{width:'auto',margin:0}} checked={show} onChange={e=>setShow(e.target.checked)}/>Show key</label>
    {msg&&<div className={'alert '+msg.k}>{msg.t}</div>}
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn ghost" disabled={busy} onClick={test}>Test connection</button><button className="btn" onClick={save}>Save and connect</button>
     {live&&<button className="btn ghost" onClick={off}>Disconnect</button>}</div>
    <p className="sync">Find both values in Supabase under Project settings, then API. Use the anon key only, never the service_role key.</p></div>
   <div className="card"><h2 style={{marginBottom:10}}>Data</h2>
    <p><span className={'dot'+(live?' live':'')}/>{live?'Connected to Supabase':'Using local browser storage'}</p>
    <div style={{display:'grid',gap:8}}>
     <button className="btn ghost" onClick={()=>csv(a.items,'inventory.csv')}>Export inventory (CSV)</button>
     <button className="btn ghost" onClick={()=>csv(a.requests,'requests.csv')}>Export requests (CSV)</button>
     <button className="btn ghost" onClick={()=>a.reload()}>Refresh data</button>
     {live?<button className="btn ghost" disabled={busy} onClick={upload}>Upload local data to Supabase</button>:<button className="btn ghost" onClick={reset}>Reset local sample data</button>}</div></div></div>
  <div className="card" style={{marginTop:16}}><div className="head" style={{marginBottom:10}}><h2>Database setup</h2><button className="btn ghost sm" onClick={copy}>Copy SQL</button></div>
   <p className="sync" style={{marginTop:0}}>Creates the items, restocks and requests tables and lets the anon key read and write them. Tighten these policies before sharing the app publicly.</p>
   <pre>{SQL}</pre></div></>;
}
