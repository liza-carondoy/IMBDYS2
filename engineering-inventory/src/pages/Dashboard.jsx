import { useState } from 'react';
import { fmt, stockOf } from '../lib/utils.js';
import { Modal, Tag, Gauge } from '../components/ui.jsx';
import ItemForm from '../components/ItemForm.jsx';

export default function Dashboard({a}){
 const [q,setQ]=useState(''),[cat,setCat]=useState('All'),[edit,setEdit]=useState(null);
 const cats=[...new Set(a.items.map(i=>i.category).filter(Boolean))].sort();
 const low=a.items.filter(i=>i.quantity<=i.min_stock);
 const units=a.items.reduce((s,i)=>s+i.quantity,0);
 const pend=a.requests.filter(r=>r.status==='pending').length;
 const rows=a.items.filter(i=>(cat==='All'||i.category===cat)&&(i.name+' '+(i.sku||'')).toLowerCase().includes(q.toLowerCase()));
 const byCat=cats.map(c=>({c,n:a.items.filter(i=>i.category===c).reduce((s,i)=>s+i.quantity,0)}));
 const max=Math.max(1,...byCat.map(x=>x.n));
 const activity=[...a.restocks.map(r=>({t:r.created_at,x:`Restocked ${r.quantity} × ${r.item_name}`,s:r.supplier||'No supplier noted'})),
  ...a.requests.map(r=>({t:r.updated_at||r.created_at,x:`${r.requester} requested ${r.quantity} × ${r.item_name}`,s:'Status: '+r.status}))]
  .sort((x,y)=>new Date(y.t)-new Date(x.t)).slice(0,6);
 return <>
  <div className="head"><div><h1>Dashboard</h1><p>Stock levels across the engineering store.</p></div><button className="btn" onClick={()=>setEdit({})}>Add item</button></div>
  <div className="grid g4" style={{marginBottom:16}}>
   <div className="card stat"><b>{a.items.length}</b><span>Item types</span></div>
   <div className="card stat ok"><b>{units}</b><span>Units on hand</span></div>
   <div className="card stat warn"><b>{low.length}</b><span>Low or out of stock</span></div>
   <div className="card stat bad" style={{borderColor:'var(--blue)'}}><b>{pend}</b><span>Pending requests</span></div></div>
  <div className="grid g2" style={{marginBottom:16}}>
   <div className="card"><h2 style={{marginBottom:10}}>Needs restocking</h2>
    {low.length?<div className="scroll"><table><tbody>{low.map(i=><tr key={i.id}><td><b>{i.name}</b><br/><small>{i.location}</small></td><td>{i.quantity} / min {i.min_stock}</td><td><Tag s={stockOf(i)[0]}>{stockOf(i)[1]}</Tag></td></tr>)}</tbody></table></div>:<div className="empty">Everything is above its minimum level.</div>}</div>
   <div className="card"><h2 style={{marginBottom:6}}>Recent activity</h2>
    {activity.length?<ul className="act">{activity.map((x,k)=><li key={k}>{x.x}<small>{x.s} · {fmt(x.t)}</small></li>)}</ul>:<div className="empty">No activity yet. Restock an item or submit a request.</div>}</div></div>
  <div className="grid g2">
   <div className="card"><h2 style={{marginBottom:10}}>All inventory</h2>
    <div className="tools"><input placeholder="Search name or SKU" aria-label="Search" value={q} onChange={e=>setQ(e.target.value)}/>
     <select aria-label="Category" value={cat} onChange={e=>setCat(e.target.value)}><option>All</option>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="scroll"><table><thead><tr><th>Item</th><th>Category</th><th>On hand</th><th>Level</th><th>Status</th><th></th></tr></thead><tbody>
     {rows.map(i=><tr key={i.id}><td><b>{i.name}</b><br/><small>{i.sku} {i.location&&'· '+i.location}</small></td><td>{i.category}</td><td>{i.quantity} {i.unit}</td><td><Gauge i={i}/></td><td><Tag s={stockOf(i)[0]}>{stockOf(i)[1]}</Tag></td>
      <td style={{whiteSpace:'nowrap'}}><button className="btn ghost sm" onClick={()=>setEdit(i)}>Edit</button> <button className="btn ghost sm" onClick={()=>a.delItem(i)}>Delete</button></td></tr>)}</tbody></table>
     {!rows.length&&<div className="empty">No items match. Add an item to get started.</div>}</div></div>
   <div className="card"><h2 style={{marginBottom:6}}>Units by category</h2>{byCat.map(x=><div className="bar" key={x.c}><span>{x.c}</span><div style={{width:x.n/max*100+'%'}}/><span>{x.n}</span></div>)}
    {!byCat.length&&<div className="empty">No categories yet.</div>}</div></div>
  {edit&&<Modal title={edit.id?'Edit item':'Add item'} onClose={()=>setEdit(null)}><ItemForm item={edit.id?edit:null} cats={cats} onClose={()=>setEdit(null)} onSave={(p,id)=>id?a.saveItem(id,p):a.addItem(p)}/></Modal>}
 </>;
}
