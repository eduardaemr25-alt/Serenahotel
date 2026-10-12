import Stripe from 'stripe';
import {NextResponse} from 'next/server';
export async function POST(request:Request){
 const secret=process.env.STRIPE_SECRET_KEY; const webhookSecret=process.env.STRIPE_WEBHOOK_SECRET;
 if(!secret||!webhookSecret||webhookSecret==='whsec_replace_me') return NextResponse.json({error:'Webhook Stripe não configurado.'},{status:503});
 const stripe=new Stripe(secret); const rawBody=await request.text(); const signature=request.headers.get('stripe-signature'); if(!signature)return NextResponse.json({error:'Assinatura em falta.'},{status:400});
 let event:Stripe.Event; try{event=stripe.webhooks.constructEvent(rawBody,signature,webhookSecret);}catch(err){console.error('Stripe webhook signature error',err);return NextResponse.json({error:'Assinatura inválida.'},{status:400});}
 if(event.type==='checkout.session.completed'){
  const session=event.data.object as Stripe.Checkout.Session;
  if(session.payment_status==='paid'){
   const email=session.customer_details?.email||session.customer_email||session.metadata?.email;
   const resendKey=process.env.RESEND_API_KEY; const from=process.env.BOOKING_FROM_EMAIL;
   if(resendKey&&from&&email){
    const m=session.metadata||{}; const money=new Intl.NumberFormat('pt-PT',{style:'currency',currency:(session.currency||'eur').toUpperCase()}).format((session.amount_total||0)/100);
    const html=`<h1>Pagamento confirmado</h1><p>Olá ${escapeHtml(m.lead_guest_name||'')}, recebemos o pagamento da sua reserva.</p><p><strong>Alojamento:</strong> ${escapeHtml(m.stay_name||'')}</p><p><strong>Localidade:</strong> ${escapeHtml(m.city||'')}</p><p><strong>Check-in:</strong> ${escapeHtml(m.checkin||'')}</p><p><strong>Check-out:</strong> ${escapeHtml(m.checkout||'')}</p><p><strong>Hóspedes:</strong> ${escapeHtml(m.guest_names||'')}</p><p><strong>Total pago:</strong> ${money}</p><p>Referência de pagamento: ${escapeHtml(session.id)}</p><p>Guarde este e-mail para consulta. Esta mensagem confirma o pagamento; os dados de disponibilidade ainda devem ser verificados pelo alojamento.</p>`;
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${resendKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[email],subject:'Pagamento confirmado — reserva de alojamento',html})});
    if(!response.ok){console.error('Resend email error',response.status,await response.text());return NextResponse.json({error:'Não foi possível enviar o e-mail de confirmação.'},{status:500});}
   } else { console.warn('Pagamento confirmado; e-mail não enviado porque RESEND_API_KEY ou BOOKING_FROM_EMAIL não estão configurados.'); }
  }
 }
 return NextResponse.json({received:true});
}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));}
