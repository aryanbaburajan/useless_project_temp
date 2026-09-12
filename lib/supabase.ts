import {createClient} from "@supabase/supabase-js";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
export const db= url&&key?createClient(url,key,{auth:{persistSession:false}}):null;
