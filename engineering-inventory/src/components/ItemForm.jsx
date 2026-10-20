import { useState } from 'react';

export default function ItemForm({item,cats,onSave,onClose}){
 const [f,setF]=useState(item||{name:'',sku:'',category:'',quantity:0,min_stock:5,unit:'pcs',location:''});
 const set=(k,v)=>setF({...f,[k]:v});
 const submit=async e=>{e.preventDefault();const {id,created_at,...p}=f;if(await onSave(p,item?.id))onClose()};
 return <form onSubmit={submit}>
  <label>Item name<input required value={f.name} onChange={e=>set('name',e.target.value)}/></label>
  <div className="row"><label>SKU / code<input value={f.sku||''} onChange={e=>set('sku',e.target.value)}/></label>
  <label>Category<input list="cats" value={f.category||''} onChange={e=>set('category',e.target.value)}/><datalist id="cats">{cats.map(c=><option key={c} value={c}/>)}</datalist></label></div>
  <div className="row"><label>Quantity on hand<input type="number" min="0" required value={f.quantity} onChange={e=>set('quantity',Number(e.target.value))}/></label>
  <label>Minimum stock level<input type="number" min="0" required value={f.min_stock} onChange={e=>set('min_stock',Number(e.target.value))}/></label></div>
  <div className="row"><label>Unit<input value={f.unit||''} onChange={e=>set('unit',e.target.value)}/></label>
  <label>Storage location<input value={f.location||''} onChange={e=>set('location',e.target.value)}/></label></div>
  <div className="mf"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn">{item?'Save changes':'Add item'}</button></div></form>;
}
