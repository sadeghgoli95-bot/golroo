import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی سایت گل‌رو؛ نحوه جمع‌آوری، استفاده و محافظت از اطلاعات کاربران.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "حریم خصوصی | گل‌رو",
    description: "سیاست حریم خصوصی سایت گل‌رو؛ نحوه جمع‌آوری، استفاده و محافظت از اطلاعات کاربران.",
    url: `${siteConfig.url}/privacy`,
    type: "website",
  },
};

const lastUpdated = new Date().toLocaleDateString("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main dir="rtl">
        <section className="editorial-space">
          <div className="container" style={{ maxWidth: 820 }}>
            <p className="overline">PRIVACY</p>
            <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)" }}>
              حریم خصوصی
            </h1>
            <p className="lead">
              حفظ حریم خصوصی شما برای ما اهمیت دارد. در این صفحه به‌سادگی توضیح می‌دهیم چه
              اطلاعاتی جمع‌آوری می‌شود، چرا و چگونه از آن استفاده می‌کنیم.
            </p>
          </div>
        </section>

        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <article className="reading article-body">
              <section>
                <h2>۱. مقدمه</h2>
                <p>
                  این صفحه توضیح می‌دهد که سایت گل‌رو چه اطلاعاتی از بازدیدکنندگان و مراجعان
                  دریافت می‌کند، این اطلاعات چگونه استفاده می‌شوند و چه تعهدی برای محافظت از آن‌ها
                  وجود دارد. هدف ما شفافیت و احترام به حریم خصوصی شماست.
                </p>
              </section>

              <section>
                <h2>۲. اطلاعاتی که جمع‌آوری می‌شود</h2>
                <p>ما فقط اطلاعاتی را جمع‌آوری می‌کنیم که خودتان مستقیماً در اختیار ما قرار می‌دهید، از جمله:</p>
                <ul>
                  <li>اطلاعات تماسی که از طریق فرم‌های سایت ارسال می‌کنید (نام، شماره تماس، ایمیل)</li>
                  <li>درخواست‌های نوبت و هماهنگی جلسه</li>
                  <li>اطلاعاتی که به‌صورت داوطلبانه از طریق پیام، ایمیل یا فرم با ما در میان می‌گذارید</li>
                </ul>
              </section>

              <section>
                <h2>۳. نحوه استفاده از اطلاعات</h2>
                <p>اطلاعات دریافتی صرفاً برای موارد زیر استفاده می‌شود:</p>
                <ul>
                  <li>پاسخ‌گویی و پیگیری درخواست‌های جلسه</li>
                  <li>ارتباط با شما درباره هماهنگی و زمان‌بندی</li>
                  <li>بهبود تجربه استفاده از سایت</li>
                  <li>حفظ امنیت سایت و جلوگیری از سوءاستفاده</li>
                </ul>
              </section>

              <section>
                <h2>۴. کوکی‌ها</h2>
                <p>
                  سایت گل‌رو تنها از کوکی‌های فنی و ضروری برای عملکرد صحیح سایت استفاده می‌کند و
                  هیچ کوکی ردیابی یا تبلیغاتی روی سایت فعال نیست.
                </p>
              </section>

              <section>
                <h2>۵. سرویس‌های شخص ثالث</h2>
                <p>برای اداره سایت از سرویس‌های زیر استفاده می‌شود:</p>
                <ul>
                  <li>Sanity CMS برای مدیریت محتوای ژورنال</li>
                  <li>سرویس میزبانی ابری برای انتشار و اجرای سایت</li>
                </ul>
                <p>هیچ سرویس تبلیغاتی یا ردیابی شخص ثالث دیگری روی این سایت فعال نیست.</p>
              </section>

              <section>
                <h2>۶. امنیت اطلاعات</h2>
                <p>
                  تلاش می‌کنیم با رعایت تدابیر فنی و سازمانی معقول، از اطلاعات شما محافظت کنیم. با
                  این حال، هیچ سامانه‌ای نمی‌تواند امنیت مطلق را تضمین کند.
                </p>
              </section>

              <section>
                <h2>۷. حریم خصوصی کودکان</h2>
                <p>
                  اگرچه تمرکز اصلی این مجموعه، روان‌درمانی کودک و نوجوان است، خدمات آنلاین این
                  سایت (فرم‌ها و ارتباطات) برای والدین یا سرپرست قانونی طراحی شده‌اند. از کودکان
                  خواسته می‌شود اطلاعات شخصی را به‌صورت مستقل در سایت وارد نکنند.
                </p>
              </section>

              <section>
                <h2>۸. حقوق شما</h2>
                <p>شما می‌توانید با تماس با ما، درخواست کنید که:</p>
                <ul>
                  <li>به اطلاعات خود دسترسی داشته باشید</li>
                  <li>اطلاعات نادرست را اصلاح کنید</li>
                  <li>حذف اطلاعات خود را درخواست دهید</li>
                </ul>
              </section>

              <section>
                <h2>۹. تماس</h2>
                <p>برای هر پرسشی درباره حریم خصوصی، از راه‌های زیر با ما در ارتباط باشید:</p>
                <ul>
                  <li>ایمیل: {siteConfig.contact.email}</li>
                  <li>
                    واتساپ:{" "}
                    <a href={siteConfig.contact.whatsapp} target="_blank" rel="noopener noreferrer">
                      ارسال پیام
                    </a>
                  </li>
                  <li>
                    تلگرام:{" "}
                    <a href={siteConfig.contact.telegram} target="_blank" rel="noopener noreferrer">
                      پیام در تلگرام
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2>۱۰. به‌روزرسانی‌ها</h2>
                <p>
                  این سیاست ممکن است در طول زمان به‌روزرسانی شود. تغییرات مهم در همین صفحه منتشر
                  خواهد شد.
                </p>
                <p className="caption">آخرین به‌روزرسانی: {lastUpdated}</p>
              </section>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
