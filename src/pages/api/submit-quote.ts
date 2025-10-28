export async function post({ request }: { request: Request }){
  try{
    const data = await request.json();
    const required = ['name','phone','email'];
    for(const k of required){ if(!data[k]) return new Response(JSON.stringify({ error: `${k} is required` }), { status: 400 }); }

    // Here you would integrate with an email provider or CRM.
    // For now return a success response echoing key fields.
    return new Response(JSON.stringify({ ok:true, received: { name: data.name, email: data.email, phone: data.phone, services: data.selectedServices||[] } }), { status: 200 });
  }catch(err){
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}
