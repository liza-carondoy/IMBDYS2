import { useState } from 'react';
import { fmt } from '../lib/utils.js';

export default function Restock({a}){
 const [f,setF]=useState({item_id:'',quantity:1,supplier:'',note:''});
 const it=a.items.find(i=>i.id===f.item_id);
 const submit=async e=>{e.preventDefault();if(await a.restock({...f,quantity:Number(f.quantity)}))setF({item_id:'',quantity:1,supplier:'',note:''})};
 return <>
  <div className="head"><div><h1>Restock entry</h1><p>Record new stock that arrived. Quantities update right away.</p></div></div>
  <div className="grid g2">
   <form className="card" onSubmit={submit}>
    <label>Item<select required value={f.item_id} onChange={e=>setF({...f,item_id:e.target.value})}><option value="">Choose an item</option>{a.items.map(i=><option key={i.id} value={i.id}>{i.name} ({i.sku})</option>)}</select></label>
    {it&&<div className="alert info">Currently {it.quantity} {it.unit} on hand. Minimum is {it.min_stock}. After this entry: {it.quantity+(Number(f.quantity)||0)} {it.unit}.</div>}
    <div className="row"><label>Quantity received<input type="number" min="1" required value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})}/></label>
    <label>Supplier<input value={f.supplier} onChange={e=>setF({...f,supplier:e.target.value})}/></label></div>
    <label>Note<textarea value={f.note} onChange={e=>setF({...f,note:e.target.value})}/></label>
    <button className="btn" disabled={!a.items.length}>Add to stock</button>
    {!a.items.length&&<p className="sync">Add an item on the dashboard first.</p>}</form>
   <div className="card"><h2 style={{marginBottom:6}}>Restock history</h2>
    {a.restocks.length?<ul className="act">{a.restocks.slice(0,12).map(r=><li key={r.id}>+{r.quantity} × {r.item_name}<small>{r.supplier||'No supplier'} · {fmt(r.created_at)}{r.note&&' · '+r.note}</small></li>)}</ul>:<div className="empty">No restocks recorded yet.</div>}</div></div></>;
}
