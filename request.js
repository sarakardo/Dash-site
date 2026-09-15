(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const normalizeDigits = (v) => String(v ?? '').replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
  const validMobile = (v) => /^09\d{9}$/.test(normalizeDigits(v).replace(/\s+/g, ''));
  const validNational = (v) => /^\d{10}$/.test(normalizeDigits(v));
  const validVIN = (v) => /^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$/.test(String(v || '').trim());
  const validName = (v) => /^[\u0600-\u06FF\u200c\sA-Za-z.\-]{2,100}$/.test(String(v || '').trim());
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const idem = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  let turnstileEnabled = false;
  let turnstileReady = false;
  const turnstileWidgets = new Map();
  async function setupTurnstile(){
    try{
      const r=await fetch('/api/config',{credentials:'same-origin',cache:'no-store'});
      const cfg=await r.json();
      turnstileEnabled=!!cfg.turnstileEnabled;
      if(!turnstileEnabled || !cfg.turnstileSiteKey) return;
      const ready=()=>{
        if(!window.turnstile)return;
        turnstileReady=true;
        [['pForm','#pTurnstile'],['dForm','#dTurnstile']].forEach(([formSel,slotSel])=>{
          const slot=document.querySelector(slotSel);
          if(slot && !turnstileWidgets.has(formSel)) turnstileWidgets.set(formSel,window.turnstile.render(slot,{sitekey:cfg.turnstileSiteKey,theme:'light'}));
        });
      };
      if(window.turnstile) ready(); else { const timer=setInterval(()=>{if(window.turnstile){clearInterval(timer);ready();}},100); setTimeout(()=>clearInterval(timer),10000); }
    }catch{}
  }
  function getTurnstileToken(formSel){
    if(!turnstileEnabled)return '';
    if(!turnstileReady||!window.turnstile)return '';
    const id=turnstileWidgets.get(formSel);
    return id ? (window.turnstile.getResponse(id)||'') : '';
  }
  function resetTurnstile(formSel){ const id=turnstileWidgets.get(formSel); if(id && window.turnstile) window.turnstile.reset(id); }

  const passenger = $('#passengerForm');
  const driver = $('#driverForm');
  const pTab = $('#passengerTab');
  const dTab = $('#driverTab');
  if (!passenger || !driver || !pTab || !dTab) return;

  function setMode(mode) {
    const isP = mode === 'p';
    passenger.hidden = !isP;
    driver.hidden = isP;
    pTab.classList.toggle('active', isP);
    dTab.classList.toggle('active', !isP);
    pTab.setAttribute('aria-selected', String(isP));
    dTab.setAttribute('aria-selected', String(!isP));
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  pTab.addEventListener('click', () => setMode('p'));
  dTab.addEventListener('click', () => setMode('d'));
  if (location.hash === '#driver') setMode('d');

  function setup(formId, prefix, total) {
    const form = $(formId);
    const card = form.closest('.form-card');
    const steps = $$('.step', form);
    const progress = $(`#${prefix}Progress`);
    const stepText = $(`#${prefix}StepText`);
    let current = 1;
    const idempotencyKey = idem();

    function setStep(n) {
      current = n;
      steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === n));
      progress.style.width = `${(n / total) * 100}%`;
      stepText.textContent = `مرحله ${n} از ${total}`;
      card.scrollIntoView({behavior: 'smooth', block: 'start'});
      const heading = steps[n - 1]?.querySelector('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({preventScroll: true});
      }
    }

    function invalid(field) {
      field?.classList.add('invalid');
    }
    function clearErrors() { $$('.field', form).forEach(f => f.classList.remove('invalid')); }

    function requiredField(el) {
      const field = el.closest('.field');
      if (!field) return true;
      const value = String(el.value || '').trim();
      let ok = !!value;
      if (el.name === 'passengerName' || el.name === 'ownerName' || el.name === 'driverName') ok = validName(value);
      if (el.type === 'tel' || el.name?.toLowerCase().includes('mobile')) ok = validMobile(value);
      if (el.name?.toLowerCase().includes('national')) ok = validNational(value);
      if (el.name === 'vin') ok = validVIN(value);
      field.classList.toggle('invalid', !ok);
      return ok;
    }

    function validateStep() {
      clearErrors();
      const active = steps[current - 1];
      let ok = true;
      active.querySelectorAll('input:not([type=file]):not([type=radio]):not([type=checkbox]), select, textarea').forEach((el) => {
        if (el.dataset.optional === 'true') return;
        if (!requiredField(el)) ok = false;
      });

      if (prefix === 'p' && current === 1) {
        const choice = form.querySelector('input[name="forWhom"]:checked');
        const choiceField = form.querySelector('input[name="forWhom"]')?.closest('.field');
        if (!choice) { invalid(choiceField); ok = false; }
        const same = $('#sameCarPlace');
        if (!same.checked && !requiredField($('#pCarPlace'))) ok = false;
      }
      if (prefix === 'p' && current === 2 && form.querySelector('#forOther')?.checked) {
        ['oName','oMobile','oNational'].forEach(id => { if (!requiredField($('#' + id))) ok = false; });
      }
      if (current === total) {
        const consent = $('input[name="consent"]', form);
        if (consent && !consent.checked) { invalid(consent.closest('.field')); ok = false; }
      }
      if (prefix === 'd' && current >= 2 && current <= 3) {
        active.querySelectorAll('input[type=file]').forEach((input) => {
          const field = input.closest('.field');
          const okFile = !!input.files?.length;
          field.classList.toggle('invalid', !okFile);
          if (!okFile) ok = false;
        });
      }
      return ok;
    }

    function renderReview() {
      const target = $(`#${prefix}Review`);
      const fd = new FormData(form);
      const labels = prefix === 'p' ? {
        requestedAt:'زمان درخواست', passengerName:'مسافر', passengerMobile:'موبایل مسافر', passengerNationalId:'کد ملی مسافر',
        ownerName:'صاحب خودرو', ownerMobile:'موبایل صاحب خودرو', ownerNationalId:'کد ملی صاحب خودرو',
        pickup:'محل سوار شدن', carPlace:'محل خودرو', destination:'مقصد', plate:'پلاک', carModel:'خودرو', vin:'VIN'
      } : {driverName:'نام راننده', driverMobile:'موبایل', driverNationalId:'کد ملی'};
      target.innerHTML = '';
      Object.entries(labels).forEach(([key, label]) => {
        const value = fd.get(key);
        if (typeof value === 'string' && value.trim()) target.insertAdjacentHTML('beforeend', `<div class="review-item"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`);
      });
      if (prefix === 'd') {
        const docs = [['idFront','روی کارت ملی'],['idBack','پشت کارت ملی'],['licFront','روی گواهینامه'],['licBack','پشت گواهینامه']];
        docs.forEach(([key,label]) => { if ($('#'+key,form)?.files?.length) target.insertAdjacentHTML('beforeend', `<div class="review-item"><span>${label}</span><strong>تصویر آماده است</strong></div>`); });
      }
    }

    form.addEventListener('click', (event) => {
      const next = event.target.closest('[data-next]');
      const prev = event.target.closest('[data-prev]');
      if (next && current < total) {
        if (!validateStep()) return;
        if (current === total - 1) renderReview();
        setStep(current + 1);
      }
      if (prev && current > 1) setStep(current - 1);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!validateStep()) return;
      const submit = form.querySelector('button[type="submit"]');
      const original = submit?.textContent || '';
      if (submit) { submit.disabled = true; submit.textContent = 'در حال ثبت…'; }
      const fd = new FormData(form);
      fd.set('idempotencyKey', idempotencyKey);
      fd.set('website', '');
      const turnstileToken=getTurnstileToken(formId);
      if(turnstileEnabled && !turnstileToken){
        const alert=document.createElement('div');alert.className='notice-mini';alert.setAttribute('role','alert');alert.textContent='لطفاً تأیید امنیتی را کامل کنید.';form.prepend(alert);setTimeout(()=>alert.remove(),6000);if(submit){submit.disabled=false;submit.textContent=original;}return;
      }
      fd.set('turnstileToken',turnstileToken);
      if (prefix === 'd') fd.set('type', 'driver_application');
      else fd.set('type', 'passenger_request');
      try {
        const response = await fetch('/api/requests', {
          method: 'POST', credentials: 'same-origin',
          headers: {'Accept':'application/json'}, body: fd
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) throw new Error(data.error || 'ثبت درخواست انجام نشد.');
        form.hidden = true;
        resetTurnstile(formId);
        const success = $(`#${prefix}Success`);
        success.style.display = 'block';
        success.focus({preventScroll:true});
        const idBox = success.querySelector('[data-request-id]');
        if (idBox && data.requestId) idBox.textContent = `کد پیگیری: ${data.requestId}`;
        window.scrollTo({top: 0, behavior:'smooth'});
      } catch (error) {
        resetTurnstile(formId);
        const alert = document.createElement('div');
        alert.className = 'notice-mini';
        alert.setAttribute('role','alert');
        alert.textContent = error.message || 'در ثبت درخواست مشکلی پیش آمد. دوباره تلاش کنید.';
        form.prepend(alert);
        setTimeout(() => alert.remove(), 7000);
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = original; }
      }
    });

    form.querySelectorAll('input[type=file]').forEach(input => {
      input.accept = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;
        const preview = $('#' + input.dataset.preview);
        if (!preview) return;
        if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5*1024*1024) {
          input.value = '';
          preview.textContent = 'JPG، PNG یا WebP تا سقف ۵ مگابایت مجاز است.';
          preview.style.display = 'flex';
          input.closest('.field')?.classList.add('invalid');
          return;
        }
        const img = document.createElement('img');
        img.alt = 'پیش‌نمایش مدرک';
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        preview.replaceChildren(img, document.createTextNode('تصویر انتخاب شد'));
        preview.style.display = 'flex';
        input.closest('.field')?.classList.remove('invalid');
      });
    });
    return {setStep};
  }

  const p = setup('#pForm','p',4);
  setup('#dForm','d',4);

  $('#sameCarPlace')?.addEventListener('change', (event) => {
    const wrap = $('#carPlaceWrap');
    if (!wrap) return;
    wrap.style.display = event.target.checked ? 'none' : 'block';
    $('#pCarPlace').required = !event.target.checked;
    if (event.target.checked) $('#pCarPlace').value = '';
  });
  $$('input[name="forWhom"]').forEach(input => input.addEventListener('change', () => {
    const other = $('#forOther')?.checked;
    const owner = $('#ownerFields');
    if (owner) owner.style.display = other ? 'block' : 'none';
    if (!other) ['oName','oMobile','oNational'].forEach(id => { const el=$('#'+id); if(el) el.value=''; });
  }));
  const honeypots = $$('input[data-honeypot]'); honeypots.forEach(h => { h.tabIndex=-1; h.autocomplete='off'; });
  $('#forSelf')?.click();
  if ($('#ownerFields')) $('#ownerFields').style.display = 'none';
  if ($('#carPlaceWrap') && $('#sameCarPlace')?.checked) $('#carPlaceWrap').style.display='none';
  setupTurnstile();
})();
