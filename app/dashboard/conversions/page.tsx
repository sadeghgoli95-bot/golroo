import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DataTable from "@/components/dashboard/DataTable";
import TrendChart from "@/components/dashboard/TrendChart";
import ExportBar from "@/components/dashboard/ExportBar";
import { BreakdownTable, ContentAttributionTable } from "./ConversionTables";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getConversionInsightsSafely } from "@/lib/analytics/conversion/safeConversionMetrics";
import { CONTENT_ATTRIBUTION_FORMULA } from "@/lib/analytics/conversion/contentAttribution";
import {
  NO_CONVERSION_EVENT_REASON,
  NO_SESSION_PATH_REASON,
  NO_ATTRIBUTION_MODEL_REASON,
  NO_REVENUE_DATA_REASON,
} from "@/lib/analytics/conversion/notAvailable";
import { compareMetricValue } from "@/lib/analytics/comparison";
import { getEngagementConversionMismatch, getCtaSuggestions } from "@/lib/analytics/conversion/businessInsights";
import type { DateRange } from "@/lib/analytics/types";
import type { ConversionRateBreakdownRow, ContentAttributionRow, ExitRateRow } from "@/lib/analytics/conversion/types";

const LAST_30_DAYS: DateRange = { preset: "last30Days", start: null, end: null };

function NotAvailableBlock({ reason }: { reason: string }) {
  return (
    <div className="dashboard-empty-state">
      <p>در دسترس نیست — {reason}</p>
    </div>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}٪`;
}

function breakdownColumns() {
  return [
    { key: "segment", label: "بخش", render: (row: ConversionRateBreakdownRow) => row.segment || "(نامشخص)" },
    { key: "sessions", label: "نشست", render: (row: ConversionRateBreakdownRow) => row.sessions },
    { key: "conversionPageViews", label: "بازدید نوبت‌دهی/تماس", render: (row: ConversionRateBreakdownRow) => row.conversionPageViews },
    { key: "conversionRate", label: "نرخ تبدیل تقریبی", render: (row: ConversionRateBreakdownRow) => formatPercent(row.conversionRate) },
  ];
}

function breakdownSortValue(row: ConversionRateBreakdownRow, key: string): number | string {
  if (key === "segment") return row.segment;
  if (key === "sessions") return row.sessions;
  if (key === "conversionPageViews") return row.conversionPageViews;
  return row.conversionRate;
}

export default async function ConversionsPage() {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
  const conversion = await getConversionInsightsSafely(LAST_30_DAYS, analyses);

  if (!conversion.data) {
    return (
      <>
        <DashboardHeader
          title="تبدیل و هوش تجاری"
          description="نرخ تبدیل تقریبی، قیف بازدید و اسناد محتوایی — مبتنی بر Google Analytics 4 (۳۰ روز اخیر)"
        />
        <div className="dashboard-empty-state">
          <p>Google Analytics 4 متصل نیست{conversion.error ? ` — ${conversion.error}` : "."}</p>
        </div>
      </>
    );
  }

  const { summary, funnel, contentAttribution, exitRates, trends } = conversion.data;
  const engagementMismatch = getEngagementConversionMismatch(contentAttribution);
  const ctaSuggestions = getCtaSuggestions(contentAttribution);

  return (
    <>
      <DashboardHeader
        title="تبدیل و هوش تجاری"
        description="نرخ تبدیل تقریبی، قیف بازدید و اسناد محتوایی — مبتنی بر Google Analytics 4 (۳۰ روز اخیر)"
      />

      <div className="dashboard-empty-state" style={{ textAlign: "right", padding: "16px 20px" }}>
        <p>
          سایت هیچ رویداد تبدیل سفارشی (مثل «نوبت رزرو شد») در GA4 ندارد. تمام اعداد این صفحه که با برچسب «تقریبی» مشخص شده‌اند،
          بر اساس بازدید واقعی صفحات <code dir="ltr">/appointment</code> و <code dir="ltr">/contact</code> محاسبه شده‌اند — نه تعداد نوبت‌های واقعاً رزرو شده.
        </p>
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۱. بازدید صفحات نوبت‌دهی و تماس (واقعی)</h2>
        <div className="dashboard-grid">
          <DashboardCard
            label="بازدید صفحه نوبت‌دهی"
            value={String(summary.pageViews.appointment.current)}
            comparison={compareMetricValue(summary.pageViews.appointment)}
            hint="بازدید واقعی /appointment"
          />
          <DashboardCard
            label="بازدید صفحه تماس"
            value={String(summary.pageViews.contact.current)}
            comparison={compareMetricValue(summary.pageViews.contact)}
            hint="بازدید واقعی /contact"
          />
          <DashboardCard
            label="مجموع بازدید نوبت‌دهی + تماس"
            value={String(summary.pageViews.combined.current)}
            comparison={compareMetricValue(summary.pageViews.combined)}
            hint="نماینده تقریبی «قصد رزرو»، نه تعداد نوبت واقعی"
          />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۲. شروع / تکمیل رزرو نوبت</h2>
        <NotAvailableBlock reason={NO_CONVERSION_EVENT_REASON} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۳ تا ۵. نرخ تبدیل تقریبی (بازدیدکننده به نوبت‌دهی)</h2>
        <div className="dashboard-grid">
          <DashboardCard
            label="نرخ تبدیل کلی (تقریبی)"
            value={formatPercent(summary.overallConversionRate.current)}
            comparison={compareMetricValue(summary.overallConversionRate)}
            hint="بازدید نوبت‌دهی+تماس ÷ کل نشست‌ها — نه نرخ تبدیل واقعی رویدادمحور"
          />
          <DashboardCard
            label="نرخ تبدیل ترافیک ارگانیک (تقریبی)"
            value={formatPercent(summary.organicConversionRate.current)}
            comparison={compareMetricValue(summary.organicConversionRate)}
            hint="همان فرمول، محدود به کانال Organic Search"
          />
          <DashboardCard
            label="نرخ تبدیل بازدیدکنندگان بازگشتی (تقریبی)"
            value={formatPercent(summary.returningConversionRate.current)}
            comparison={compareMetricValue(summary.returningConversionRate)}
            hint="همان فرمول، محدود به newVsReturning = returning"
          />
          <DashboardCard
            label="نرخ تبدیل بازدیدکنندگان جدید (تقریبی)"
            value={formatPercent(summary.newVisitorConversionRate.current)}
            comparison={compareMetricValue(summary.newVisitorConversionRate)}
            hint="همان فرمول، محدود به newVsReturning = new"
          />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۶. میانگین زمان تا رزرو / تعداد نشست تا رزرو</h2>
        <NotAvailableBlock reason={NO_SESSION_PATH_REASON} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۷. صفحات فرود / مقالاتی که مستقیماً منجر به نوبت‌دهی شده‌اند</h2>
        <NotAvailableBlock reason={NO_SESSION_PATH_REASON} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۸ و ۹. کانال‌های تبدیل و تفکیک دستگاه / کشور / بازدیدکننده جدید-بازگشتی (تقریبی)</h2>
        <h3 className="dashboard-section-title">بر اساس کانال ورودی</h3>
        <BreakdownTable rows={summary.channelBreakdown} emptyMessage="داده‌ای وجود ندارد." />
        <h3 className="dashboard-section-title">بر اساس دستگاه</h3>
        <BreakdownTable rows={summary.deviceBreakdown} emptyMessage="داده‌ای وجود ندارد." />
        <h3 className="dashboard-section-title">بر اساس کشور</h3>
        <BreakdownTable rows={summary.countryBreakdown} emptyMessage="داده‌ای وجود ندارد." />
        <h3 className="dashboard-section-title">بازدیدکننده جدید در مقابل بازگشتی</h3>
        <DataTable
          rows={summary.newVsReturningBreakdown}
          columns={breakdownColumns()}
          getRowKey={(row) => row.segment}
          emptyMessage="داده‌ای وجود ندارد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۱۰. قیف تبدیل (تقریبی، تجمیعی)</h2>
        <p className="dashboard-card-hint">
          این قیف مسیر تک‌تک کاربران را دنبال نمی‌کند — هر مرحله یک شمارش تجمیعی مستقل برای کل بازه است، نه «چند نفر از مرحله قبل به این مرحله رسیدند».
        </p>
        <DataTable
          rows={funnel}
          columns={[
            { key: "label", label: "مرحله", render: (row) => row.label },
            { key: "value", label: "مقدار", render: (row) => row.value },
            { key: "dropOff", label: "افت نسبت به مرحله قبل", render: (row) => (row.dropOffPercent === null ? "—" : formatPercent(row.dropOffPercent)) },
          ]}
          getRowKey={(row) => row.label}
          emptyMessage="داده‌ای وجود ندارد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۱۱. گزارش‌های اسناد (First/Last/Multi-touch/Assisted/Top Paths)</h2>
        <NotAvailableBlock reason={NO_ATTRIBUTION_MODEL_REASON} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۱۲. اسناد محتوایی — تخمین سهم مقالات در قصد رزرو</h2>
        <p className="dashboard-card-hint">{CONTENT_ATTRIBUTION_FORMULA}</p>
        <ContentAttributionTable rows={contentAttribution} emptyMessage="مقاله‌ای یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۱۳. بینش‌های تجاری</h2>

        <h3 className="dashboard-section-title">فرصت درآمدی</h3>
        <NotAvailableBlock reason={NO_REVENUE_DATA_REASON} />

        <h3 className="dashboard-section-title">نرخ خروج بالاترین صفحات (واقعی)</h3>
        <DataTable
          rows={exitRates}
          columns={[
            { key: "page", label: "صفحه", render: (row: ExitRateRow) => row.page },
            { key: "pageViews", label: "بازدید", render: (row: ExitRateRow) => row.pageViews },
            { key: "exits", label: "خروج", render: (row: ExitRateRow) => row.exits },
            { key: "exitRate", label: "نرخ خروج", render: (row: ExitRateRow) => formatPercent(row.exitRate) },
          ]}
          getRowKey={(row, index) => `${row.page}-${index}`}
          emptyMessage="داده‌ای وجود ندارد."
        />

        <h3 className="dashboard-section-title">ناهماهنگی تعامل بالا / بدون لینک نوبت‌دهی (واقعی، مشتق‌شده)</h3>
        <p className="dashboard-card-hint">مقالاتی با نرخ تعامل بالاتر از میانگین که هیچ لینک داخلی به نوبت‌دهی یا تماس ندارند.</p>
        <DataTable
          rows={engagementMismatch}
          columns={[
            { key: "title", label: "عنوان", render: (row: ContentAttributionRow) => row.title },
            { key: "engagementRate", label: "نرخ تعامل", render: (row: ContentAttributionRow) => `${(row.engagementRate * 100).toFixed(1)}٪` },
            { key: "landingSessions", label: "نشست فرود", render: (row: ContentAttributionRow) => row.landingSessions },
          ]}
          getRowKey={(row) => row.slug}
          emptyMessage="موردی یافت نشد."
        />

        <h3 className="dashboard-section-title">پیشنهاد افزودن CTA (قاعده‌محور، بدون عدد ساختگی)</h3>
        <DataTable
          rows={ctaSuggestions}
          columns={[
            { key: "title", label: "عنوان", render: (row) => row.title },
            { key: "landingSessions", label: "نشست فرود", render: (row) => row.landingSessions },
            { key: "reason", label: "دلیل", render: (row) => row.reason },
          ]}
          getRowKey={(row) => row.slug}
          emptyMessage="پیشنهادی یافت نشد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۱۴. نمودارهای روند (تقریبی)</h2>
        <div className="dashboard-grid">
          <TrendChart title="روند نرخ تبدیل کلی" points={trends.conversionRate} />
          <TrendChart title="روند نرخ تبدیل ارگانیک" points={trends.organicConversionRate} />
          <TrendChart title="روند قیف — بازدید نوبت‌دهی/تماس" points={trends.funnelViews} />
          <TrendChart title="روند بازدید صفحات (فرود)" points={trends.pageViews} />
          <TrendChart title="روند بازدید محتوای ژورنال" points={trends.contentViews} />
          {trends.topChannels.map((channel) => (
            <TrendChart key={channel.channel} title={`روند نرخ تبدیل کانال: ${channel.channel}`} points={channel.points} />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="conversion-insights"
          jsonData={conversion.data}
          csvRows={contentAttribution.map((row) => ({
            slug: row.slug,
            title: row.title,
            landingSessions: row.landingSessions,
            engagementRate: row.engagementRate,
            bookingLinkCount: row.bookingLinkCount,
            estimatedScore: row.estimatedScore,
          }))}
        />
      </section>
    </>
  );
}
