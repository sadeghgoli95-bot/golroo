# گل‌رو (Golroo)

برند شخصی صادق گل‌رو — روان‌درمانگر کودک و نوجوان (۰ تا ۱۲ سال).
سایت محتوا-محور با تمرکز روی سئو و یادداشت‌های بالینی.

## Tech Stack
- Next.js 16 (App Router, TypeScript)
- Sanity.io (CMS برای مقالات)
- Vazirmatn font, RTL
- Deploy: Vercel via GitHub (هر push خودکار deploy می‌شود)

## Commands
- `npm run dev` — سرور توسعه (localhost:3000)
- `npm run build` — بیلد پروداکشن (قبل از هر push حتماً اجرا کن تا خطای Vercel نگیریم)
- `npm run lint` — بررسی lint

## Architecture
- `app/` — صفحات و routing
- `components/` — کامپوننت‌های UI (هر بخش فایل جدا)
- `lib/` — یوتیلیتی‌های مشترک (siteConfig، فرمت تاریخ فارسی، rate limit، mailer و غیره)
- `data/` — داده‌های ثابت غیر-Sanity (topics، observations قدیمی و غیره — برای صفحات knowledge)
- `sanity/` — schema و query های CMS (منبع اصلی داده مقالات ژورنال)
- `docs/` — منشور برند و راهنمای تحریریه (editorial-bible.md مرجع لحن است)

## Design System
- تمام رنگ/فاصله/فونت از `app/globals.css` (CSS variables) می‌آید
- پالت: پس‌زمینه کرم گرم (#FCFAF5)، سبز عمیق به‌عنوان امضای برند (#2E4C47)، نعنایی ملایم (#CBEDE0)، هایلایت زرد گرم (#FFF6D9)
- بدون border-radius اغراق‌آمیز، بدون سایه سنگین، فضای خالی زیاد

## Conventions
- کامپوننت‌ها: default export، PascalCase
- استفاده از className از globals.css به‌جای inline style برای چیزهای تکرارشونده
- عناوین فارسی، کدها انگلیسی
- هر جای انگلیسی وسط فارسی، جهت متن حفظ شود

## Critical
- قبل از هر git push، `npm run build` را اجرا کن؛ Vercel روی خطای TypeScript بیلد را رد می‌کند
- محتوای مقالات باید با docs/editorial-bible.md هم‌خوان باشد
- هیچ‌وقت secret یا API key در کد commit نشود
