import { readFile } from 'node:fs/promises';
import path from 'node:path';
export type Stay = { slug: string; name: string; city: string; region: string; description: string; price: number; rating: number; reviews: number; guests: number; image: string; tags: string[]; stripePaymentUrl?: string };
export async function getStays(): Promise<Stay[]> {
  try { const raw = await readFile(path.join(process.cwd(), 'data', 'stays.json'), 'utf8'); return JSON.parse(raw) as Stay[]; }
  catch { return []; }
}
export async function getStayBySlug(slug: string) { return (await getStays()).find((stay) => stay.slug === slug); }
export function getNights(checkin: string, checkout: string) { const start = new Date(`${checkin}T12:00:00`); const end = new Date(`${checkout}T12:00:00`); return Math.round((end.getTime()-start.getTime())/86400000); }
