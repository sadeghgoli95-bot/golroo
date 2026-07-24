/**
 * Real, specific reasons for every Phase 7 metric that has no honest way
 * to be computed from what's actually instrumented on the live site
 * today (no custom "appointment booked" event, no funnel/session-path
 * tracking — see the Phase 7 brief's honesty constraint). Centralized so
 * the same structural limitation is described the same way everywhere it
 * applies, instead of re-worded per section.
 */
export const NO_CONVERSION_EVENT_REASON =
  "این معیار نیاز به رویداد تبدیل سفارشی (مثلاً «نوبت رزرو شد») در GA4 دارد که هنوز روی سایت پیاده‌سازی نشده است.";

export const NO_SESSION_PATH_REASON =
  "این معیار نیاز به داده مسیر نشست (session path) به‌ازای هر کاربر دارد که در گزارش‌های پایه GA4 Data API در دسترس نیست و روی این سایت پیکربندی نشده است.";

export const NO_ATTRIBUTION_MODEL_REASON =
  "این معیار نیاز به گزارش‌های اختصاصی Attribution/Advertising در GA4 دارد (نه runReport پایه) که برای این پراپرتی پیکربندی نشده است.";

export const NO_REVENUE_DATA_REASON =
  "هیچ داده قیمت‌گذاری یا درآمد واقعی در این سیستم وجود ندارد؛ محاسبه «فرصت درآمدی» بدون آن صرفاً یک عدد ساختگی خواهد بود.";
