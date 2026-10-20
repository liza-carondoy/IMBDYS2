import { useState } from 'react';
import { fmt } from '../lib/utils.js';
import { Modal } from '../components/ui.jsx';

export default function Pending({a}){
 const list=a.requests.filter(r=>r.status==='pending').reverse();
 const [rej,setRej]=useState(null),[note,setNote]=useState('');
 return <>
  <div className="head"><div><h1>Pending requests</h1><p>Approve to deduct stock, or reject with a reason.</p></div></div>
  {list.map(r=>{const it=a.items.find(i=>i.id===r.item_id);const short=!it||it.quantity<r.quantity;
   return <div className="card req" key={r.id}><div>
    <h3>{r.quantity} × {r.item_name}</h3>
    <p>{r.requester}{r.department&&' · '+r.department} · {fmt(r.created_at)}</p>
    {r.purpose&&<p>Purpose: {r.purpose}</p>}
    <p style={{color:short?'var(--red)':'var(--green)',fontWeight:500}}>{it?`${it.quantity} ${it.unit} in stock${short?'. Not enough to approve.':''}`:'Item no longer exists.'}</p></div>
    <div style={{display:'flex',gap:8}}><button className="btn green" disabled={short} onClick={()=>a.review(r,'approved')}>Approve</button>
    <button className="btn red" onClick={()=>{setRej(r);setNote('')}}>Reject</button></div></div>})}
  {!list.length&&<div className="card empty">No pending requests. New requests appear here once someone submits them on the Request status page.</div>}
  {rej&&<Modal title="Reject request" onClose={()=>setRej(null)}>
   <p>{rej.requester} asked for {rej.quantity} × {rej.item_name}.</p>
   <label>Reason (shown to the requester)<textarea autoFocus value={note} onChange={e=>setNote(e.target.value)}/></label>
   <div className="mf"><button className="btn ghost" onClick={()=>setRej(null)}>Cancel</button><button className="btn red" onClick={async()=>{await a.review(rej,'rejected',note);setRej(null)}}>Reject request</button></div></Modal>}</>;
}
