export const nameKey="apex-display-name";
export const getName=()=>typeof window==="undefined"?"":localStorage.getItem(nameKey)||"";
export const saveName=(name:string)=>localStorage.setItem(nameKey,name.trim().slice(0,32));
export const getPB=(id:string)=>{const n=Number(localStorage.getItem(`apex-pb-${id}`));return n>0?n:undefined};
export const savePB=(id:string,ms:number)=>{const old=getPB(id);if(!old||ms<old)localStorage.setItem(`apex-pb-${id}`,String(ms));return !old||ms<old};
