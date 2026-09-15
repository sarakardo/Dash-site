(() => {
  'use strict';
  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#contactStatus');
  if (!form || !status) return;
  const button = form.querySelector('button[type="submit"]');
  const key = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  let widgetId=null;
  async function initTurnstile(){
    try{const r=await fetch('/api/config',{credentials:'same-origin',cache:'no-store'});const c=await r.json();if(!c.turnstileEnabled||!c.turnstileSiteKey)return;const render=()=>{if(window.turnstile&&!widgetId){const slot=document.querySelector('#cTurnstile');if(slot)widgetId=window.turnstile.render(slot,{sitekey:c.turnstileSiteKey,theme:'light'});}};if(window.turnstile)render();else{const t=setInterval(()=>{if(window.turnstile){clearInterval(t);render();}},100);setTimeout(()=>clearInterval(t),10000);}}catch{}
  }
  initTurnstile();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.hidden = true;
    if (!form.reportValidity()) return;
    if(widgetId&&window.turnstile&&!window.turnstile.getResponse(widgetId)){status.hidden=false;status.textContent='لطفاً تأیید امنیتی را کامل کنید.';return;}
    button.disabled = true; button.textContent = 'در حال ارسال…';
    const fd = new FormData(form); fd.set('type','contact'); fd.set('idempotencyKey',key); if(widgetId&&window.turnstile) fd.set('turnstileToken',window.turnstile.getResponse(widgetId)||'');
    try {
      const r = await fetch('/api/requests',{method:'POST',credentials:'same-origin',headers:{'Accept':'application/json'},body:fd});
      const d = await r.json().catch(()=>({}));
      if(!r.ok || !d.ok) throw new Error(d.error || 'ارسال پیام انجام نشد.');
      status.textContent = d.message || 'پیامتان دریافت شد.'; status.className='notice good'; status.hidden=false;
      form.reset(); if(widgetId&&window.turnstile) window.turnstile.reset(widgetId);
    } catch (err) {
      status.textContent = err.message || 'در ارسال پیام مشکلی پیش آمد. دوباره تلاش کنید.'; status.className='notice bad'; status.hidden=false;
    } finally { button.disabled=false; button.textContent='ارسال پیام'; }
  });
})();
