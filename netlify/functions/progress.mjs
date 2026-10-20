import { createClient } from '@supabase/supabase-js';
import { worlds } from '../../shared/content.js';
import { scoreMission } from '../../shared/scoring.js';
const reply=(statusCode,data)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(data)});
export async function handler(event){
 if(!['GET','POST'].includes(event.httpMethod))return reply(405,{error:'Metode tidak didukung'});
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return reply(503,{error:'Backend belum dikonfigurasi. Gunakan mode tamu.'});
 const token=(event.headers.authorization||'').replace(/^Bearer /i,'');
 if(!token)return reply(401,{error:'Silakan masuk kembali.'});
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||!user)return reply(401,{error:'Sesi berakhir. Silakan masuk kembali.'});
 if(event.httpMethod==='POST'){
 if((event.body||'').length>2048)return reply(413,{error:'Permintaan terlalu besar'});
 let body;try{body=JSON.parse(event.body||'{}')}catch{return reply(400,{error:'Format tidak valid'})}
 let score;try{score=scoreMission(body.worldId,body.answers)}catch{return reply(400,{error:'Jawaban tidak valid'})}
 const index=worlds.findIndex(w=>w.id===body.worldId);
 if(index>0){const {data:prev,error:e}=await db.from('progress').select('stars').eq('user_id',user.id).eq('world_id',worlds[index-1].id).maybeSingle();if(e)throw e;if(!prev||prev.stars<1)return reply(403,{error:'Selesaikan lokasi sebelumnya dahulu.'});}
 const {error:e}=await db.rpc('record_progress',{p_user:user.id,p_world:body.worldId,p_stars:score.stars});if(e)throw e;
 return reply(200,score);
 }
 const {data,error:e}=await db.from('progress').select('world_id,stars,updated_at').eq('user_id',user.id);if(e)throw e;
 return reply(200,{progress:Object.fromEntries(data.map(r=>[r.world_id,r.stars]))});
 }catch{return reply(500,{error:'Progres belum dapat disimpan. Coba kembali.'})}
}
