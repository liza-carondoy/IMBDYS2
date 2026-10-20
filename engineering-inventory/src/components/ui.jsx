import { useEffect } from 'react';
import { stockOf } from '../lib/utils.js';

export function Modal({title,onClose,children}){
 useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
 return <div className="scrim" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
  <div className="modal" role="dialog" aria-label={title}><div className="mh"><h3>{title}</h3><button className="x" onClick={onClose} aria-label="Close">×</button></div>{children}</div></div>;
}
export const Tag=({s,children})=><span className={'tag t-'+s}>{children||s}</span>;
export const Gauge=({i})=>{const cap=Math.max(i.min_stock*3,i.quantity,1);const [s]=stockOf(i);
 return <div className="gauge" title={`${i.quantity} on hand, minimum ${i.min_stock}`}><i style={{width:Math.min(100,i.quantity/cap*100)+'%',background:s==='ok'?'var(--green)':s==='low'?'var(--amber)':'var(--red)'}}/><b style={{left:(i.min_stock/cap*100)+'%'}}/></div>};
