export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();
        const name = String(body.name || '').trim();
        const phone = String(body.phone || '').trim();
        const email = String(body.email || '').trim();
        const subject = String(body.subject || '').trim();
        const message = String(body.message || '').trim();
        const honeypot = String(body.website || '').trim();

        if (honeypot) return json({ ok: true, message: 'پیام دریافت شد.' });
        if (!name || !phone || !message) {
          return json({ ok: false, error: 'نام، شماره تماس و متن پیام الزامی است.' }, 400);
        }
        if (message.length > 5000 || name.length > 120 || phone.length > 40 || email.length > 160 || subject.length > 180) {
          return json({ ok: false, error: 'طول یکی از فیلدها بیش از حد مجاز است.' }, 400);
        }

        await env.DB.prepare(`INSERT INTO contact_messages (name, phone, email, subject, message, user_agent) VALUES (?, ?, ?, ?, ?, ?)`)
          .bind(name, phone, email, subject, message, request.headers.get('user-agent') || '')
          .run();

        return json({ ok: true, message: 'پیامت با موفقیت برای دش ارسال شد.' });
      } catch (e) {
        return json({ ok: false, error: 'در ارسال پیام مشکلی پیش آمد. لطفاً دوباره تلاش کنید.' }, 500);
      }
    }

    if (url.pathname === '/api/messages' && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
          return json({ ok: false, error: 'رمز عبور نادرست است.' }, 401);
        }
        const result = await env.DB.prepare(`SELECT id, name, phone, email, subject, message, created_at, status FROM contact_messages ORDER BY id DESC LIMIT 200`).all();
        return json({ ok: true, messages: result.results || [] });
      } catch (e) {
        return json({ ok: false, error: 'دریافت پیام‌ها ممکن نشد.' }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}
