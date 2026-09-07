# استقرار نهایی دش روی Cloudflare Workers

این نسخه عمداً یک درخت فایل یکپارچه و flat دارد: `index.html` در ریشه است و `chekhabar/` فقط یک بخش از سایت است، نه صفحه اصلی.

## Cloudflare
- Repository: `sarakardo/Dash-site`
- Branch: `main`
- Build command: None
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- `wrangler.jsonc` از `assets.directory = "."` استفاده می‌کند.

## نکته مهم
این بسته برای جایگزینی کامل محتوای repository ساخته شده است. فایل‌های قدیمی نباید کنار فایل‌های این بسته باقی بمانند، چون هدف این است که یک درخت واحد و بدون نسخه‌های متناقض deploy شود.

پس از فعال شدن دامنه نهایی `dashh.ir`، canonical/OG/sitemap باید از Worker URL به دامنه نهایی تغییر داده شوند.
