(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const table = $('#adminTable');
  const loginPanel = $('#loginPanel');
  const dashboard = $('#dashboard');
  const message = $('#adminMessage');
  let csrf = '';
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const mask = (v) => { const s=String(v||''); return s.length<=4 ? '••••' : `${'•'.repeat(Math.max(1,s.length-4))}${s.slice(-4)}`; };
  function showMessage(text,good=false){message.textContent=text;message.className=good?'admin-message good':'admin-message';}
  async function getSession(){const r=await fetch('/api/admin/session',{credentials:'same-origin',cache:'no-store'});if(!r.ok)return false;const d=await r.json();csrf=d.csrfToken||'';loginPanel.hidden=true;dashboard.hidden=false;return true;}
  async function login(){const password=$('#adminPassword').value;if(!password){showMessage('رمز عبور را وارد کنید.');return}const r=await fetch('/api/admin/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok){showMessage(d.error||'ورود انجام نشد.');return}csrf=d.csrfToken||'';loginPanel.hidden=true;dashboard.hidden=false;$('#adminPassword').value='';await load();}
  async function load(){
    const type=$('#filterType').value,status=$('#filterStatus').value,q=$('#searchQuery')?.value?.trim()||'';const qs=new URLSearchParams();if(type)qs.set('type',type);if(status)qs.set('status',status);if(q)qs.set('q',q);
    const r=await fetch('/api/admin/requests?'+qs.toString(),{credentials:'same-origin',cache:'no-store'});const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.ok){showMessage(d.error||'دریافت اطلاعات انجام نشد.');if(r.status===401){loginPanel.hidden=false;dashboard.hidden=true}return}
    const rows=d.requests||[];
    table.innerHTML=rows.length?rows.map(row=>{
      let docs=[];try{docs=JSON.parse(row.documents_json||'[]')}catch{}
      const typeLabel=row.type==='passenger_request'?'درخواست سفر':row.type==='driver_application'?'ثبت‌نام راننده':'پیام';
      const mainName=row.passenger_name||row.driver_name||row.contact_name||'—';const phone=row.passenger_mobile||row.driver_mobile||row.contact_method||'—';
      const national=row.passenger_national_id_masked||row.driver_national_id_masked||'';
      const detail=row.type==='passenger_request'?`<div>${esc(row.pickup||'—')} → ${esc(row.destination||'—')}</div><small>${esc(row.car_model||'')} · ${esc(row.plate||'')}</small>`:row.type==='driver_application'?`<div>${docs.length} مدرک دریافت شده</div><small>${esc(row.driver_mobile||'')}</small>`:`<div>${esc(row.contact_message||'')}</div>`;
      const note=esc(row.notes||'');
      return `<tr><td><strong>${esc(typeLabel)}</strong><div class="muted">${esc(row.id)}</div><small>${esc(row.created_at||'')}</small></td><td>${esc(mainName)}<div class="muted">${esc(phone)}</div></td><td>${national?esc(mask(national)):'—'}</td><td>${detail}<div class="admin-note"><textarea data-note="${esc(row.id)}" maxlength="3000" placeholder="یادداشت داخلی">${note}</textarea><button class="mini save-note" data-note-id="${esc(row.id)}">ذخیره یادداشت</button></div></td><td><select data-status="${esc(row.id)}"><option value="new" ${row.status==='new'?'selected':''}>جدید</option><option value="contacted" ${row.status==='contacted'?'selected':''}>تماس گرفته شد</option><option value="driver_found" ${row.status==='driver_found'?'selected':''}>راننده پیدا شد</option><option value="in_progress" ${row.status==='in_progress'?'selected':''}>در حال انجام</option><option value="completed" ${row.status==='completed'?'selected':''}>تکمیل شد</option><option value="cancelled" ${row.status==='cancelled'?'selected':''}>لغو شد</option></select><button class="mini danger delete-row" data-delete-id="${esc(row.id)}">حذف</button></td><td>${row.type==='driver_application'&&docs.length?docs.map(doc=>`<button class="mini" data-doc="${esc(doc.key)}">${esc(doc.label)}</button>`).join(' '):'—'}</td></tr>`;
    }).join(''):'<tr><td colspan="6" class="empty">هنوز موردی ثبت نشده است.</td></tr>';
  }
  table.addEventListener('change',async e=>{const id=e.target.dataset.status;if(!id)return;const r=await fetch('/api/admin/status',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({id,status:e.target.value})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok){showMessage(d.error||'تغییر وضعیت انجام نشد.');await load();return}showMessage('وضعیت ذخیره شد.',true)});
  table.addEventListener('click',async e=>{
    const doc=e.target.closest('[data-doc]');if(doc){const r=await fetch('/api/admin/document?key='+encodeURIComponent(doc.dataset.doc),{credentials:'same-origin',cache:'no-store'});if(!r.ok){showMessage('دسترسی به مدرک ممکن نیست.');return}const url=URL.createObjectURL(await r.blob());window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60000);return}
    const save=e.target.closest('.save-note');if(save){const id=save.dataset.noteId;const ta=table.querySelector(`textarea[data-note="${CSS.escape(id)}"]`);const r=await fetch('/api/admin/notes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({id,notes:ta?.value||''})});const d=await r.json().catch(()=>({}));showMessage(d.ok?'یادداشت ذخیره شد.':(d.error||'ذخیره نشد.'),!!d.ok);return}
    const del=e.target.closest('.delete-row');if(del){if(!confirm('این درخواست و مدارک متصل به آن حذف شوند؟'))return;const r=await fetch('/api/admin/delete',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({id:del.dataset.deleteId})});const d=await r.json().catch(()=>({}));showMessage(d.ok?'درخواست حذف شد.':(d.error||'حذف انجام نشد.'),!!d.ok);if(d.ok)load()}
  });
  $('#loginButton')?.addEventListener('click',login);$('#adminPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')login()});$('#refreshButton')?.addEventListener('click',load);$('#filterType')?.addEventListener('change',load);$('#filterStatus')?.addEventListener('change',load);$('#searchQuery')?.addEventListener('keydown',e=>{if(e.key==='Enter')load()});$('#logoutButton')?.addEventListener('click',async()=>{await fetch('/api/admin/logout',{method:'POST',credentials:'same-origin',headers:{'X-CSRF-Token':csrf}});csrf='';dashboard.hidden=true;loginPanel.hidden=false;showMessage('از پنل خارج شدید.')});getSession().then(ok=>{if(ok)load()});
})();
