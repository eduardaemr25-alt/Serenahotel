import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {getStayBySlug,getNights} from '@/lib/stays';
export async function POST(request:Request){
 const form=await request.formData();
 const slug=String(form.get('slug')||''); const checkin=String(form.get('checkin')||''); const checkout=String(form.get('checkout')||'');
 const guests=Number(form.get('guests')||2); const leadGuestName=String(form.get('leadGuestName')||'').trim(); const email=String(form.get('email')||'').trim(); const guestNames=String(form.get('guestNames')||'').trim();
 const stay=await getStayBySlug(slug); const nights=getNights(checkin,checkout);
 if(!stay||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(checkin)||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(checkout)||nights<1||!Number.isInteger(guests)||guests<1||guests>stay.guests||leadGuestName.length<2||leadGuestName.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||guestNames.length<2||guestNames.length>1000){return NextResponse.json({error:'Dados inválidos. Verifique datas, hóspedes, nome e e-mail.'},{status:400});}
 const secret=process.env.STRIPE_SECRET_KEY;
 if(!secret||secret==='sk_test_replace_me'){return NextResponse.json({error:'Checkout não configurado. Configure STRIPE_SECRET_KEY no .env.local.'},{status:503});}
 try{
  const stripe=new Stripe(secret); const baseUrl=process.env.NEXT_PUBLIC_SITE_URL||new URL(request.url).origin;
  const session=await stripe.checkout.sessions.create({mode:'payment',payment_method_types:['card'],customer_email:email,client_reference_id:slug,line_items:[{quantity:nights,price_data:{currency:'eur',unit_amount:stay.price*100,product_data:{name:`${stay.name} — noite`,description:`Estadia demonstrativa em ${stay.city}`}}}],success_url:`${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${baseUrl}/cancel`,metadata:{stay_slug:stay.slug,stay_name:stay.name,city:stay.city,checkin,checkout,guests:String(guests),nights:String(nights),lead_guest_name:leadGuestName,email,guest_names:guestNames,demo:'true'},payment_intent_data:{receipt_email:email,metadata:{stay_slug:stay.slug,checkin,checkout}},billing_address_collection:'auto',});
  if(!session.url)return NextResponse.json({error:'Não foi possível iniciar o checkout.'},{status:502}); return NextResponse.redirect(session.url,303);
 }catch(error){console.error('Stripe checkout error',error);return NextResponse.json({error:'Falha ao iniciar pagamento. Verifique a configuração do Stripe.'},{status:502});}
}
