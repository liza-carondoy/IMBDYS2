import { useState } from 'react';
import { fmt } from '../lib/utils.js';
import { Modal, Tag } from '../components/ui.jsx';

export default function Status({a}){
 const [tab,setTab]=useState('all'),[q,setQ]=useState(''),[nw,setNw]=useState(false);
 const [f,setF]=useState({item_id:'',quantity:1,requester:'',department:'',purpose:''});
 const tabs=['all','pending','approved','rejected','cancelled'];
 const rows=a.requests.filter(r=>(tab==='all'||r.status===tab)&&(r.item_name+' '+r.requester).toLowerCase().includes(q.toLowerCase()));
 const submit=async e=>{e.preventDefault();if(await a.request({...f,quantity:Number(f.quantity)})){setNw(false);setF({item_id:'',quantity:1,requester:'',department:'',purpose:''})}};
 return <>
  <div className="head"><div><h1>Request status</h1><p>Track every request from submission to decision.</p></div><button className="btn" onClick={()=>setNw(true)}>New request</button></div>
  <div className="card">
   <div className="tabs">{tabs.map(t=><button key={t} className={tab===t?'on':''} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)} ({t==='all'?a.requests.length:a.requests.filter(r=>r.status===t).length})</button>)}</div>
   <div className="tools"><input placeholder="Search item or requester" aria-label="Search" value={q} onChange={e=>setQ(e.target.value)}/></div>
   <div className="scroll"><table><thead><tr><th>Item</th><th>Qty</th><th>Requester</th><th>Submitted</th><th>Status</th><th>Reviewer note</th><th></th></tr></thead><tbody>
    {rows.map(r=><tr key={r.id}><td><b>{r.item_name}</b></td><td>{r.quantity}</td><td>{r.requester}<br/><small>{r.department}</small></td><td>{fmt(r.created_at)}</td><td><Tag s={r.status}/></td><td>{r.reviewer_note}</td>
     <td>{r.status==='pending'&&<button className="btn ghost sm" onClick={()=>a.review(r,'cancelled')}>Cancel</button>}</td></tr>)}</tbody></table>
    {!rows.length&&<div className="empty">No requests found for this view.</div>}</div></div>
  {nw&&<Modal title="New request" onClose={()=>setNw(false)}><form onSubmit={submit}>
   <label>Item<select required value={f.item_id} onChange={e=>setF({...f,item_id:e.target.value})}><option value="">Choose an item</option>{a.items.map(i=><option key={i.id} value={i.id}>{i.name} ({i.quantity} {i.unit} left)</option>)}</select></label>
   <div className="row"><label>Quantity<input type="number" min="1" required value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})}/></label>
   <label>Your name<input required value={f.requester} onChange={e=>setF({...f,requester:e.target.value})}/></label></div>
   <label>Department<input value={f.department} onChange={e=>setF({...f,department:e.target.value})}/></label>
   <label>Purpose<textarea value={f.purpose} onChange={e=>setF({...f,purpose:e.target.value})}/></label>
   <div className="mf"><button type="button" className="btn ghost" onClick={()=>setNw(false)}>Cancel</button><button className="btn">Submit request</button></div></form></Modal>}</>;
}
