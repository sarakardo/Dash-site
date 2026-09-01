# Write HTML Pages (Index, Chekhabar, GEO Cluster, Request, About, FAQ, Configs)

def write_html(filename, title, description, content, json_ld=None):
    path = os.path.join(base_dir, filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    # Calculate relative root for CSS/assets
    depth = len(filename.split('/')) - 1
    rel_path = "../" * depth
    
    schema_markup = f'<script type="application/ld+json">\n{json_ld}\n</script>' if json_ld else ''
    
    html = f"""<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | Dash دش</title>
  <meta name="description" content="{description}">
  <link rel="canonical" href="https://dashapp.ir/{filename}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://dashapp.ir/{filename}">
  <link rel="stylesheet" href="{rel_path}style.css">
  {schema_markup}
</head>
<body>
  <header>
    <div class="header-container">
      <a href="{rel_path}index.html" class="logo">Dash <span>راننده جایگزین</span></a>
      <nav>
        <ul>
          <li><a href="{rel_path}index.html">صفحه اصلی</a></li>
          <li><a href="{rel_path}chekhabar/index.html">چخبر؟</a></li>
          <li><a href="{rel_path}about.html">درباره دش</a></li>
          <li><a href="{rel_path}faq.html">سوالات متداول</a></li>
          <li><a href="{rel_path}request.html" class="cta-btn">درخواست راننده</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    {content}
  </main>

  <footer>
    <div class="footer-grid">
      <div class="footer-col">
        <h4>Dash | راننده جایگزین</h4>
        <p style="font-size:0.9rem; color:#cbd5e1;">سامانه تخصصی اعزام راننده مجرب برای خودروی شخصی شما در تمام مناطق تهران و حومه.</p>
      </div>
      <div class="footer-col">
        <h4>دسترسی سریع</h4>
        <ul>
          <li><a href="{rel_path}request.html">ثبت درخواست راننده</a></li>
          <li><a href="{rel_path}chekhabar/index.html">مجله چخبر؟</a></li>
          <li><a href="{rel_path}about.html">تفاوت Dash با تاکسی اینترنتی</a></li>
          <li><a href="{rel_path}faq.html">سوالات متداول</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>خدمات تخصصی GEO</h4>
        <ul>
          <li><a href="{rel_path}after-surgery-driving.html">رانندگی بعد از عمل</a></li>
          <li><a href="{rel_path}elderly-driver-safety.html">راننده سالمندان</a></li>
          <li><a href="{rel_path}fatigue-and-driving.html">رانندگی هنگام خستگی</a></li>
          <li><a href="{rel_path}alcohol-and-driving.html">بازگشت امن بدون رانندگی</a></li>
        </ul>
      </div>
    </div>
    <div class="copyright">
      <p>© کلیه حقوق مادی و معنوی متعلق به سرویس راننده جایگزین Dash (دش) می‌باشد.</p>
    </div>
  </footer>
</body>
</html>"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)

# 1. INDEX.HTML
index_content = """
<section class="hero">
  <div class="hero-content">
    <h1>خودرو از شما، راننده امن و حرفه‌ای از Dash</h1>
    <p>اگر به دلیل عمل جراحی، بیماری، خستگی، مصرف دارو یا تصمیم بر عدم رانندگی شرایط هدایت خودرو را ندارید، رانندگان تاییدشده Dash خودروی شخصی شما را به مقصد می‌رسانند.</p>
    <a href="request.html" class="cta-btn" style="font-size:1.1rem; padding:0.8rem 1.8rem;">درخواست فوری راننده جایگزین</a>
  </div>
  <div class="hero-image">
    <img src="assets/hero-iran.webp" alt="خدمات راننده جایگزین Dash در تهران" width="800" height="450">
  </div>
</section>

<section class="direct-answer-box">
  <h2>آیا Dash یک تاکسی اینترنتی است؟</h2>
  <p><strong>خیر.</strong> در تاکسی اینترنتی، شما مسافر خودروی فرد دیگری می‌شوید. در Dash، راننده جایگزین مجرب اعزام می‌شود تا <strong>خودروی شخصی خود شما</strong> را تا منزل یا مقصد مورد نظرتان رانندگی کند.</p>
</section>

<h2 style="font-size:1.6rem; color:var(--secondary); margin-bottom:1.5rem;">چه زمانی به راننده جایگزین نیاز دارید؟</h2>
<div class="card-grid">
  <div class="card">
    <img src="assets/iranian-after-surgery-driver.webp" alt="رانندگی بعد از عمل جراحی" width="400" height="200" loading="lazy">
    <div class="card-body">
      <span class="card-tag">پزشکی و سلامت</span>
      <h3 class="card-title">رانندگی بعد از عمل و بیهوشی</h3>
      <p class="card-text">بعد از جراحی یا معاینات دارای داروی بیهوشی/آرام‌بخش امکان رانندگی ندارید؟ خودرویتان را به همراه راننده دش به خانه برگردانید.</p>
      <a href="after-surgery-driving.html" class="card-link">اطلاعات بیشتر ←</a>
    </div>
  </div>

  <div class="card">
    <img src="assets/iranian-elderly-driver-safety.webp" alt="راننده شخصی برای سالمندان" width="400" height="200" loading="lazy">
    <div class="card-body">
      <span class="card-tag">ایمنی خانواده</span>
      <h3 class="card-title">انتقال ایمن سالمندان و والدین</h3>
      <p class="card-text">برای والدین سالمندی که رانندگی در ترافیک تهران برایشان دشوار است، راننده مطمئن اختصاص دهید.</p>
      <a href="elderly-driver-safety.html" class="card-link">اطلاعات بیشتر ←</a>
    </div>
  </div>

  <div class="card">
    <img src="assets/fatigue-driver-iran.webp" alt="رانندگی در حالت خستگی و خواب آلودگی" width="400" height="200" loading="lazy">
    <div class="card-body">
      <span class="card-tag">پیشگیری از حادثه</span>
      <h3 class="card-title">خستگی شدید و خواب‌آلودگی</h3>
      <p class="card-text">پس از یک روز کاری طولانی یا شیفت شب، خطر نکنید. راننده جایگزین شما را با ماشین خودتان به مقصد می‌رساند.</p>
      <a href="fatigue-and-driving.html" class="card-link">اطلاعات بیشتر ←</a>
    </div>
  </div>
</div>
"""

write_html("index.html", "Dash | سامانه راننده جایگزین خودرو شخصی", "Dash سرویس آنلاین درخواست راننده جایگزین برای خودرو شخصی در تهران. انتقال امن خودرو و مسافر بعد از عمل جراحی، بیماری، خستگی و مواقع غیرمنتظره.", index_content, """{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dash",
  "url": "https://dashapp.ir",
  "logo": "https://dashapp.ir/assets/hero-iran.webp",
  "description": "سرویس ارائه راننده جایگزین برای خودروهای شخصی"
}""")

# 2. REQUEST.HTML (Multi-step Form)
request_content = """
<div class="form-card">
  <h1 style="font-size:1.6rem; color:var(--secondary); text-align:center; margin-bottom:0.5rem;">ثبت درخواست راننده جایگزین Dash</h1>
  <p style="text-align:center; color:var(--text-muted); margin-bottom:2rem; font-size:0.95rem;">فرآیند درخواست در ۳ مرحله کوتاه انجام می‌شود.</p>

  <div class="progress-indicator">
    <div class="step-item active" id="p-step-1"><span class="step-number">۱</span> اطلاعات مسافر</div>
    <div class="step-item" id="p-step-2"><span class="step-number">۲</span> مشخصات خودرو</div>
    <div class="step-item" id="p-step-3"><span class="step-number">۳</span> مبداء و مقصد</div>
  </div>

  <form id="dashRequestForm" onsubmit="event.preventDefault(); alert('درخواست شما با موفقیت ثبت شد. کارشناسان Dash جهت هماهنگی با شما تماس خواهند گرفت.');">
    <!-- Step 1 -->
    <div id="step-1">
      <div class="form-group">
        <label for="passenger_name">نام و نام خانوادگی مسافر / درخواست‌کننده</label>
        <input type="text" id="passenger_name" required placeholder="مثال: علی رضایی">
      </div>
      <div class="form-group">
        <label for="passenger_phone">شماره همراه مسافر</label>
        <input type="tel" id="passenger_phone" required placeholder="۰۹۱۲XXXXXXX">
      </div>
      <div class="form-group">
        <label for="passenger_national_id">کد ملی مسافر</label>
        <input type="text" id="passenger_national_id" required placeholder="جهت احراز هویت و پوشش بیمه‌ای">
        <div class="help-text">اطلاعات شما نزد Dash محفوظ بوده و صرفاً جهت صادر شدن بیمه‌نامه سفر دریافت می‌شود.</div>
      </div>
      <div class="form-actions">
        <div></div>
        <button type="button" class="btn-primary" onclick="goToStep(2)">مرحله بعد: مشخصات خودرو ←</button>
      </div>
    </div>

    <!-- Step 2 -->
    <div id="step-2" style="display:none;">
      <div class="form-group">
        <label for="owner_name">نام و نام خانوادگی مالک خودرو</label>
        <input type="text" id="owner_name" required placeholder="در صورت یکسان بودن با مسافر، همان را وارد کنید">
      </div>
      <div class="form-group">
        <label for="car_model">نام و مدل دقیق خودرو</label>
        <input type="text" id="car_model" required placeholder="مثال: پژو ۲۰۷ دنده‌ای / دیگنیتی اتوماتیک">
      </div>
      <div class="form-group">
        <label for="car_plate">شماره پلاک خودرو</label>
        <input type="text" id="car_plate" required placeholder="ایران -- / --- ج --">
      </div>
      <div class="form-group">
        <label for="car_vin">شماره VIN خودرو (اختیاری)</label>
        <input type="text" id="car_vin" placeholder="درج شده روی کارت شناسایی خودرو">
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="goToStep(1)">→ مرحله قبل</button>
        <button type="button" class="btn-primary" onclick="goToStep(3)">مرحله بعد: مبداء و مقصد ←</button>
      </div>
    </div>

    <!-- Step 3 -->
    <div id="step-3" style="display:none;">
      <div class="form-group">
        <label for="origin">مبداء (محل فعلی خودرو و مسافر)</label>
        <input type="text" id="origin" required placeholder="نام محله، خیابان، پلاک یا مرکز درمانی/بیمارستان">
      </div>
      <div class="form-group">
        <label for="destination">مقصد نهایی</label>
        <input type="text" id="destination" required placeholder="آدرس دقیق مقصد">
      </div>
      <div class="form-group">
        <label for="notes">توضیحات تکمیلی (اختیاری)</label>
        <input type="text" id="notes" placeholder="مثلاً: وضعیت بیمار بعد از عمل، گیربکس اتوماتیک و ...">
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="goToStep(2)">→ مرحله قبل</button>
        <button type="submit" class="btn-primary" style="background:#10b981;">ثبت نهایی درخواست راننده</button>
      </div>
    </div>
  </form>
</div>

<script>
function goToStep(step) {
  document.getElementById('step-1').style.display = 'none';
  document.getElementById('step-2').style.display = 'none';
  document.getElementById('step-3').style.display = 'none';
  
  document.getElementById('p-step-1').classList.remove('active');
  document.getElementById('p-step-2').classList.remove('active');
  document.getElementById('p-step-3').classList.remove('active');

  document.getElementById('step-' + step).style.display = 'block';
  document.getElementById('p-step-' + step).classList.add('active');
}
</script>
"""

write_html("request.html", "ثبت آنلاین درخواست راننده جایگزین", "فرم مرحله‌ای و آسان درخواست راننده جایگزین Dash برای خودرو شخصی در تهران. ثبت هویت، اطلاعات خودرو و آدرس مبداء و مقصد.", request_content)

# 3. CHEKHABAR INDEX & ARTICLES
chekhabar_index = """
<section style="text-align:center; margin-bottom:3rem;">
  <h1 style="font-size:2.2rem; color:var(--secondary); margin-bottom:0.8rem;">مجله «چخبر؟» Dash</h1>
  <p style="color:var(--text-muted); max-width:650px; margin:0 auto;">منبع تخصصی مقالات آموزشی درباره ایمنی راه، سلامت رانندگی، فرهنگ ترافیک و کمک‌های اولیه کاربردی.</p>
</section>

<div class="card-grid">
  <div class="card">
    <img src="../assets/medical-cinema-vs-reality.webp" alt="باورهای اشتباه امدادی در فیلم‌ها" width="400" height="200">
    <div class="card-body">
      <span class="card-tag">کمک‌های اولیه & پزشکی</span>
      <h2 class="card-title">سینما یا واقعیت؟ ۴ باور پزشکی و امدادی که فیلم‌ها اشتباه نشان می‌دهند</h2>
      <p class="card-text">بررسی علمی تصورات نادرست سینمایی درباره شوک قلبی، خفگی، زخم گلوله و استفاده از بتادین روی زخم باز.</p>
      <a href="medical-cinema-vs-reality.html" class="card-link">ادامه مقاله ←</a>
    </div>
  </div>

  <div class="card">
    <img src="../assets/tehran-traffic-culture.webp" alt="ترافیک تهران و فرهنگ رانندگی" width="400" height="200">
    <div class="card-body">
      <span class="card-tag">فرهنگ رانندگی & ترافیک</span>
      <h2 class="card-title">ترافیک تهران فقط مشکل خیابان نیست؛ فرهنگ رانندگی چه نقشی دارد؟</h2>
      <p class="card-text">چگونه رفتارهای فردی، خستگی، مدیریت سفر و انتخاب گزینه راننده جایگزین می‌تواند ترافیک و رفتارهای پرخطر شهری را کاهش دهد.</p>
      <a href="tehran-traffic-culture.html" class="card-link">ادامه مقاله ←</a>
    </div>
  </div>
</div>
"""

write_html("chekhabar/index.html", "مجله چخبر؟ | مقالات ایمنی و سلامت رانندگی", "مجله آموزشی Dash با مقالات تخصصی درباره سلامت در رانندگی، کمک‌های اولیه واقعی، تحلیل ترافیک تهران و ایمنی سفر.", chekhabar_index)

# Article 1: Medical Cinema vs Reality
art1_content = """
<article class="article-container">
  <header class="article-header">
    <span class="card-tag">کمک‌های اولیه & پزشکی</span>
    <h1>سینما یا واقعیت؟ ۴ باور پزشکی و امدادی که فیلم‌ها اشتباه نشان می‌دهند</h1>
    <div class="article-meta">
      <span>تاریخ انتشار: شهریور ۱۴۰۵</span>
      <span>زمان مطالعه: ۶ دقیقه</span>
    </div>
  </header>

  <img src="../assets/medical-cinema-vs-reality.webp" alt="باورهای غلط پزشکی در سینما" class="article-hero-img" width="800" height="420">

  <div class="article-body">
    <p>بسیاری از ما اطلاعات اولیه خود را درباره موقعیت‌های اضطراری پزشکی از فیلم‌ها و سریال‌های هالیوودی و ایرانی به دست آورده‌ایم. اما واقعیت علمی بسیار متفاوت از نمایش‌های پر هیجان سینمایی است. در این مقاله ۴ باور رایج و خطرناک را با دلایل پزشکی بررسی می‌کنیم.</p>

    <h2>۱. شوک قلبی (Defibrillation)</h2>
    <p>در فیلم‌ها می‌بینیم که خط دستگاه مانیتور صاف می‌شود (Asystole)، پزشک شوک‌دهنده را روی سینه بیمار می‌گذارد، بیمار نیم متر از تخت بلند شده و ناگهان ضربان قلب برمی‌گردد! <strong>این تصور کاملاً غلط است.</strong></p>
    <p>در واقعیت، دستگاه الکتروشوک (Defibrillator) برای ریست کردن ریتم‌های آشفته قلبی استفاده می‌شود، نه برای شروع مجدد قلبی که کاملاً متوقف شده است. ریتم‌های قلبی به دو دسته تقسیم می‌شوند:</p>
    <ul>
      <li><strong>ریتم‌های قابل شوک (Shockable Rhythms):</strong> شامل فیبریلاسیون بطنی (VF) و تاکیکاردی بطنی بدون نبض (Pulseless VT). در این حالت‌ها قلب حرکت نامنظم دارد و شوک باعث هماهنگی مجدد آن می‌شود.</li>
      <li><strong>ریتم‌های غیرقابل شوک (Non-shockable Rhythms):</strong> شامل ایست کامل قلبی (Asystole) و فعالیت الکتریکی بدون نبض (PEA). در خط صاف (Asystole) اعمال شوک هیچ تأثیری ندارد و تنها احیای قلبی-ریوی (CPR) و تزریق اپی‌نفرین خط اول درمان است.</li>
    </ul>

    <h2>۲. انسداد راه هوایی و خفگی</h2>
    <p>در سینما به محض اینکه فردی هنگام غذا خوردن به سرفه می‌افتد، اطرافیان فوراً به پشت او ضربات محکم می‌زنند یا مانور هایملیک را اجرا می‌کنند.</p>
    <p>پروتکل رسمی امداد نجات تأکید می‌کند: اگر فرد هنوز توانایی سرفه کردن مؤثر دارد، انسداد راه هوایی نسبی است. در این وضعیت، بهترین کار تشویق بیمار به سرفه کردن است. ضربه زدن به پشت فردی که سرفه می‌کند ممکن است باعث شود جسم خارجی بیشتر به سمت پایین ریه فرستاده شود. ضربه به پشت و مانور هایملیک فقط زمانی مجاز است که فرد اصلاً نتواند نفس بکشد، سرفه کند یا صحبت نماید (انسداد کامل).</p>

    <h2>۳. زخم گلوله و سوزاندن رگ‌ها</h2>
    <p>باور سینمایی دیگری مدعی است: «اگر گلوله از فاصله نزدیک شلیک شود، حرارت بالای آن رگ‌ها را می‌سوزاند و باعث می‌شود خونریزی ایجاد نشود!»</p>
    <p>این ادعا کاملاً اشتباه است. اگرچه فاصله شلیک بر الگوی سوختگی پوست و سوختگی باروت تأثیر می‌گذارد، اما گلوله به هیچ وجه رگ‌های خونی پاره شده را مسدود یا مسدود/کوتر نمیکند. پاره شدن عروق بزرگ توسط شلیک نزدیک، خونریزی بسیار شدیدی ایجاد می‌کند که نیازمند پانسمان فشاری فوری و تورنیکت است.</p>

    <h2>۴. استفاده مستقیم از بتادین روی زخم باز</h2>
    <p>خیلی از افراد ریختن مستقیم پوویدون-آیوداین (بتادین) روی زخم عمیق و باز را نشانه ضدعفونی کامل می‌دانند.</p>
    <p>بتادین یک ضدعفونی‌کننده عالی برای <strong>پوست سالم اطراف زخم</strong> است. اما ریختن مستقیم آن روی بافت زنده و باز داخل زخم، به سلول‌های سالم ترمیمی (فیبروبلاست‌ها) آسیب می‌زند و فرآیند بهبود زخم را به تأخیر می‌اندازد. برای شستشوی داخل زخم، سرم نمکی (نرمال سالین) یا آب تمیز جاری بهترین و ایمن‌ترین گزینه است.</p>

    <div class="cta-banner">
      <h3>آنچه فیلم‌ها به ما یاد داده‌اند، همیشه کمک‌های اولیه واقعی نیست.</h3>
      <p>در شرایط واقعی، حفظ آرامش و اتخاذ تصمیم‌های علمی اولین گام حفظ سلامت است. اگر پس از خدمات درمانی توانایی رانندگی ندارید، انتقال خودروی خود را به متخصصان بسپارید.</p>
      <a href="../request.html" class="cta-btn">درخواست راننده جایگزین Dash</a>
    </div>

    <h2>منابع علمی مقاله</h2>
    <ul>
      <li>American Heart Association (AHA) Resuscitation Guidelines</li>
      <li>Red Cross First Aid Manual - Airway Obstruction Protocols</li>
    </ul>
  </div>
</article>
"""

write_html("chekhabar/medical-cinema-vs-reality.html", "سینما یا واقعیت؟ ۴ باور پزشکی و امدادی اشتباه در فیلم‌ها", "تحلیل علمی ۴ باور نادرست سینمایی درباره شوک قلبی، خفگی، زخم گلوله و بتادین به زبان ساده در مجله چخبر Dash.", art1_content, """{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "سینما یا واقعیت؟ ۴ باور پزشکی و امدادی که فیلم‌ها اشتباه نشان می‌دهند",
  "image": "https://dashapp.ir/assets/medical-cinema-vs-reality.webp",
  "publisher": {
    "@type": "Organization",
    "name": "Dash"
  }
}""")

# Article 2: Tehran Traffic Culture
art2_content = """
<article class="article-container">
  <header class="article-header">
    <span class="card-tag">فرهنگ رانندگی & ترافیک</span>
    <h1>ترافیک تهران فقط مشکل خیابان نیست؛ فرهنگ رانندگی چه نقشی دارد؟</h1>
    <div class="article-meta">
      <span>تاریخ انتشار: شهریور ۱۴۰۵</span>
      <span>زمان مطالعه: ۵ دقیقه</span>
    </div>
  </header>

  <img src="../assets/tehran-traffic-culture.webp" alt="ترافیک و فرهنگ رانندگی در تهران" class="article-hero-img" width="800" height="420">

  <div class="article-body">
    <p>ترافیک کلان‌شهر تهران همواره به‌عنوان مسئله‌ای سخت‌افزاری مانند کمبود بزرگراه، تعداد زیاد خودروها یا نقص در حمل‌ونقل عمومی تحلیل می‌شود. اما تحلیل‌گران اجتماعی و ایمنی راه معتقدند بخش عمده‌ای از گره‌های ترافیکی ناشی از «الگوهای رفتاری و فرهنگ رانندگی» است.</p>

    <h2>نقش رفتار رانندگان در ایجاد ترافیک کاذب</h2>
    <p>رانندگی با خستگی، تغییر خطوط ناگهانی، توقف‌های دوبله غیرمجاز و عدم رعایت فاصله طولی نه تنها خطر تصادف را چند برابر می‌کند، بلکه موج‌های ترمز ناگهانی (Shockwave Traffic) ایجاد کرده و کیلومترها ترافیک سنگین پشت سر خود بر جای می‌گذارد.</p>

    <h2>گاهی مسئله این نیست که سفر انجام شود یا نه؛ مسئله این است که چه کسی باید رانندگی کند!</h2>
    <p>تصور کنید راننده‌ای که پس از ۱۰ ساعت کار فشرده یا حضور در یک جلسه درمانی با خستگی شدید پشت فرمان می‌نشیند. تمرکز پایین این راننده باعث کندی تصمیم‌گیری، حرکت نامنظم و در نهایت خطای انسانی می‌شود.</p>

    <p>در بسیاری از جوامع پیشرفته، فرهنگ «راننده جایگزین» این مشکل را حل کرده است. زمانی که فرد احساس خستگی، خواب‌آلودگی یا عدم تمرکز می‌کند، به جای نشستن پشت فرمان، مدیریت خودرو را به راننده‌ای تازه نفس می‌سپارد.</p>

    <div class="cta-banner">
      <h3>فرهنگ رانندگی مسئولانه با Dash</h3>
      <p>اگر با خودروی شخصی در شهر حضور دارید اما آمادگی ذهنی یا جسمی رانندگی در ترافیک سنگین را ندارید، راننده جایگزین Dash خودروی شما را به مقصد می‌رساند.</p>
      <a href="../request.html" class="cta-btn">رزرو آنلاین راننده جایگزین</a>
    </div>

    <h2>منابع و منبع‌دهی</h2>
    <p style="font-size:0.85rem; color:var(--text-muted);">تحلیل‌های این مقاله با استناد به گزارش‌های تحلیل رفتار ترافیکی و استراتژی‌های کاهش ترافیک شهری (مندرج در <a href="https://www.jamaran.news/%D8%A8%D8%AE%D8%B4-%D8%AC%D8%A7%D9%85%D8%B9%D9%87-132/722173-%DA%86%D9%86%D8%AF-%D8%B1%D8%A7%D9%87%DA%A9%D8%A7%D8%B1-%D8%A8%D8%B1%D8%A7%DB%8C-%DA%A9%D8%A7%D9%87%D8%B4-%D8%AA%D8%B1%D8%A7%D9%8ف%DB%8C%DA%A9-%D8%AF%D8%B1-%D8%B4%D9%87%D8%B1-%D8%AA%D9%87%D8%B1%D8%A7%D9%86" target="_blank" rel="noopener">پایگاه خبری جماران</a>) تدوین شده است.</p>
  </div>
</article>
"""

write_html("chekhabar/tehran-traffic-culture.html", "ترافیک تهران و نقش فرهنگ رانندگی | مجله چخبر Dash", "بررسی نقش خستگی، رفتارهای فردی و سرویس‌های راننده جایگزین در روان‌سازی ترافیک کلان‌شهر تهران.", art2_content, """{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "ترافیک تهران فقط مشکل خیابان نیست؛ فرهنگ رانندگی چه نقشی دارد؟",
  "image": "https://dashapp.ir/assets/tehran-traffic-culture.webp",
  "publisher": {
    "@type": "Organization",
    "name": "Dash"
  }
}""")

print("Main & Chekhabar pages generated.")