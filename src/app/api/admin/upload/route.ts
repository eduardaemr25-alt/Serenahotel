import {NextResponse} from 'next/server';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {isAdmin,unauthorized} from '@/lib/admin-server';
export const runtime='nodejs';
export async function POST(request:Request){if(!await isAdmin())return unauthorized();try{const form=await request.formData();const file=form.get('file');if(!(file instanceof File))return NextResponse.json({error:'Selecione uma imagem.'},{status:400});if(!['image/jpeg','image/png','image/webp'].includes(file.type))return NextResponse.json({error:'Use uma imagem JPG, PNG ou WebP.'},{status:400});if(file.size>5*1024*1024)return NextResponse.json({error:'A imagem deve ter até 5 MB.'},{status:400});const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';const folder=path.join(process.cwd(),'public','uploads');await mkdir(folder,{recursive:true});const filename=`${randomUUID()}.${ext}`;await writeFile(path.join(folder,filename),Buffer.from(await file.arrayBuffer()));return NextResponse.json({url:`/uploads/${filename}`})}catch(error){console.error(error);return NextResponse.json({error:'Falha ao enviar imagem.'},{status:500})}}
