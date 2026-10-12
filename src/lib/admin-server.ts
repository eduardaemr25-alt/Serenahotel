import {createHmac,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
export async function isAdmin(){const password=process.env.ADMIN_PASSWORD;if(!password||password.length<12)return false;const jar=await cookies();const actual=jar.get('serena_admin')?.value||'';const expected=createHmac('sha256',password).update('serena-admin-session-v1').digest('hex');const a=Buffer.from(actual);const b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)}
export function unauthorized(){return NextResponse.json({error:'Acesso não autorizado. Entre no painel novamente.'},{status:401})}
