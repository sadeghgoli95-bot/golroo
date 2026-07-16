import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "قوانین و مقررات",
  description: "شرایط استفاده از سایت گل‌رو و درخواست جلسه روان‌درمانی.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "قوانین و مقررات | گل‌رو",
    description: "شرایط استفاده از سایت گل‌رو و درخواست جلسه روان‌درمانی.",
    url: `${siteConfig.url}/terms`,
    type: "website",
  },
};

const lastUpdated = new Date().toLocaleDateString("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main dir="rtl">
        <section className="editorial-space">
          <div className="container" style={{ maxWidth: 820 }}>
            <p className="overline">TERMS</p>
            <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)" }}>
              قوانین و مقررات
            </h1>
            <p className="lead">
              این صفحه شرایط استفاده از سایت گل‌رو و نحوه ثبت درخواست جلسه را به‌روشنی توضیح
              می‌دهد.
            </p>
          </div>
        </section>

        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <article className="reading article-body">
              <section>
                <h2>۱. مقدمه</h2>
                <p>
                  این قوانین، نحوه استفاده از سایت گل‌رو و ثبت درخواست جلسه را مشخص می‌کنند. با
                  استفاده از این سایت، پذیرفتن این شرایط را تأیید می‌کنید.
                </p>
              </section>

              <section>
                <h2>۲. هدف اطلاع‌رسانی محتوا</h2>
                <p>
                  محتوای این سایت صرفاً جنبه آموزشی و اطلاع‌رسانی دارد و جایگزین ارزیابی روان‌شناختی،
                  تشخیص یا روان‌درمانی نیست. خواندن یک مقاله به معنای شکل‌گیری رابطه درمانگر و
                  مراجع نخواهد بود.
                </p>
              </section>

              <section>
                <h2>۳. درخواست جلسه</h2>
                <p>
                  ثبت درخواست جلسه از طریق سایت، تضمینی برای رزرو قطعی نوبت نیست. جلسات تنها پس از
                  هماهنگی مستقیم قطعی می‌شوند.
                </p>
              </section>

              <section>
                <h2>۴. جلسات آنلاین</h2>
                <p>
                  برای برگزاری جلسات آنلاین، به اتصال اینترنت پایدار و فضایی خصوصی نیاز است.
                  اطلاعات تکمیلی پیش از اولین جلسه در اختیار شما قرار خواهد گرفت.
                </p>
              </section>

              <section>
                <h2>۵. محرمانگی</h2>
                <p>
                  اطلاعاتی که در جریان روان‌درمانی به اشتراک گذاشته می‌شود، در چارچوب استانداردهای
                  اخلاقی و قانونی مربوطه محرمانه باقی می‌ماند. لطفاً از ارتباطات سایت برای ارسال
                  اطلاعات بالینی فوری یا بسیار حساس استفاده نکنید.
                </p>
              </section>

              <section>
                <h2>۶. مالکیت معنوی</h2>
                <p>
                  تمامی مقالات، متون، تصاویر، برندینگ و محتوای این سایت متعلق به محمد صادق گل‌رو
                  است، مگر آنکه خلاف آن ذکر شده باشد. بازنشر بدون اجازه ممنوع است؛ نقل‌قول با ذکر
                  منبع مجاز است.
                </p>
              </section>

              <section>
                <h2>۷. پیوندهای خارجی</h2>
                <p>
                  این سایت ممکن است حاوی پیوندهایی به وب‌سایت‌های دیگر باشد. مسئولیتی در قبال
                  محتوا یا سیاست حریم خصوصی این سایت‌ها بر عهده گرفته نمی‌شود.
                </p>
              </section>

              <section>
                <h2>۸. محدودیت مسئولیت</h2>
                <p>
                  تلاش می‌شود اطلاعات ارائه‌شده دقیق باشد؛ با این حال، تضمینی وجود ندارد که هر
                  مقاله برای هر فرد کامل یا قابل‌اجرا باشد.
                </p>
              </section>

              <section>
                <h2>۹. تغییرات</h2>
                <p>این قوانین ممکن است در طول زمان به‌روزرسانی شود.</p>
                <p className="caption">آخرین به‌روزرسانی: {lastUpdated}</p>
              </section>

              <section>
                <h2>۱۰. تماس</h2>
                <ul>
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
                  <li>تلفن: {siteConfig.contact.phones.map((phone) => phone).join(" — ")}</li>
                  <li>آدرس: {siteConfig.contact.address}</li>
                </ul>
              </section>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
