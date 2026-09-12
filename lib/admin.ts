import {createHmac,timingSafeEqual} from "crypto";import {cookies} from "next/headers";
const key=process.env.ADMIN_PASSPHRASE||"";const cookie="maniac-admin";
const sign=(value:string)=>createHmac("sha256",key).update(value).digest("hex");
export function sessionValue(){const exp=Math.floor(Date.now()/1000)+60*60*8;return `${exp}.${sign(String(exp))}`}
export async function isAdmin(){if(!key)return false;const v=(await cookies()).get(cookie)?.value;if(!v)return false;const [exp,hash]=v.split(".");if(!exp||!hash||Number(exp)<Date.now()/1000)return false;const expected=sign(exp);return hash.length===expected.length&&timingSafeEqual(Buffer.from(hash),Buffer.from(expected))}
export {cookie};
