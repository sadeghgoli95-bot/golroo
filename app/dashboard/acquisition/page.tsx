import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DataTable from "@/components/dashboard/DataTable";
import ExportBar from "@/components/dashboard/ExportBar";
import { getTrafficMetricsSafely } from "@/lib/analytics/safeGoogleMetrics";
import { compareMetricValue } from "@/lib/analytics/comparison";
import type { DateRange } from "@/lib/analytics/types";
import type { LandingPageMetric, TrafficSourceMetric, DeviceMetric, CountryMetric } from "@/lib/analytics/traffic/types";

const LAST_30_DAYS: DateRange = { preset: "last30Days", start: null, end: null };

const ORGANIC_CHANNEL_LABEL = "Organic Search";

const landingPageColumns = [
  { key: "path", label: "صفحه فرود", render: (row: LandingPageMetric) => row.path },
  { key: "sessions", label: "نشست", render: (row: LandingPageMetric) => row.sessions },
  { key: "users", label: "کاربر", render: (row: LandingPageMetric) => row.users },
];

const sourceColumns = [
  { key: "source", label: "منبع/کانال", render: (row: TrafficSourceMetric) => row.source },
  { key: "sessions", label: "نشست", render: (row: TrafficSourceMetric) => row.sessions },
  { key: "users", label: "کاربر", render: (row: TrafficSourceMetric) => row.users },
];

const deviceColumns = [
  { key: "device", label: "دستگاه", render: (row: DeviceMetric) => row.device },
  { key: "sessions", label: "نشست", render: (row: DeviceMetric) => row.sessions },
  { key: "users", label: "کاربر", render: (row: DeviceMetric) => row.users },
];

const countryColumns = [
  { key: "country", label: "کشور", render: (row: CountryMetric) => row.country },
  { key: "sessions", label: "نشست", render: (row: CountryMetric) => row.sessions },
  { key: "users", label: "کاربر", render: (row: CountryMetric) => row.users },
];

export default async function AcquisitionPage() {
  const traffic = await getTrafficMetricsSafely(LAST_30_DAYS);

  if (!traffic.data) {
    return (
      <>
        <DashboardHeader
          title="جذب مخاطب (Acquisition)"
          description="مردم چطور میرورا را پیدا می‌کنند؟ — مبتنی بر Google Analytics 4 (۳۰ روز اخیر)"
        />
        <div className="dashboard-empty-state">
          <p>Google Analytics 4 متصل نیست{traffic.error ? ` — ${traffic.error}` : "."}</p>
        </div>
      </>
    );
  }

  const data = traffic.data;
  const organicSource = data.trafficSources.find((row) => row.source === ORGANIC_CHANNEL_LABEL) ?? null;
  const organicShare = organicSource && data.sessions.current > 0 ? (organicSource.sessions / data.sessions.current) * 100 : null;

  return (
    <>
      <DashboardHeader
        title="جذب مخاطب (Acquisition)"
        description="مردم چطور میرورا را پیدا می‌کنند؟ — مبتنی بر Google Analytics 4 (۳۰ روز اخیر در مقابل ۳۰ روز قبل از آن)"
      />

      <div className="dashboard-grid">
        <DashboardCard label="کاربران" value={String(data.users.current)} comparison={compareMetricValue(data.users)} />
        <DashboardCard label="نشست‌ها" value={String(data.sessions.current)} comparison={compareMetricValue(data.sessions)} />
        <DashboardCard
          label="نشست‌های تعامل‌دار"
          value={String(data.engagedSessions.current)}
          comparison={compareMetricValue(data.engagedSessions)}
        />
        <DashboardCard
          label="نرخ تعامل"
          value={`${(data.engagementRate.current * 100).toFixed(1)}٪`}
          comparison={compareMetricValue(data.engagementRate)}
        />
        <DashboardCard
          label="میانگین زمان نشست"
          value={`${Math.round(data.averageSessionDuration.current)} ثانیه`}
          comparison={compareMetricValue(data.averageSessionDuration)}
        />
        <DashboardCard label="کاربران جدید" value={String(data.newUsers.current)} comparison={compareMetricValue(data.newUsers)} />
        <DashboardCard
          label="بازدیدکنندگان بازگشتی"
          value={String(data.returningVisitors.current)}
          comparison={compareMetricValue(data.returningVisitors)}
        />
        <DashboardCard label="نرخ خروج" value={`${(data.bounceRate.current * 100).toFixed(1)}٪`} comparison={compareMetricValue(data.bounceRate)} invertColor />
        <DashboardCard label="بازدید صفحات" value={String(data.pageViews.current)} comparison={compareMetricValue(data.pageViews)} />
        <DashboardCard
          label="صفحه به ازای هر نشست"
          value={data.pagesPerSession.current.toFixed(2)}
          comparison={compareMetricValue(data.pagesPerSession)}
        />
        <DashboardCard
          label="ترافیک ارگانیک (نشست)"
          value={organicSource ? String(organicSource.sessions) : "۰"}
          hint={organicShare !== null ? `${organicShare.toFixed(1)}٪ از کل نشست‌ها` : "داده‌ای برای کانال Organic Search یافت نشد."}
        />
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحات ورودی (Landing Pages) — کدام صفحات کاربران را وارد سایت می‌کنند</h2>
        <DataTable rows={data.landingPages} getRowKey={(row) => row.path} emptyMessage="داده‌ای وجود ندارد." columns={landingPageColumns} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">منابع ترافیک (Traffic Sources / Channels)</h2>
        <DataTable rows={data.trafficSources} getRowKey={(row) => row.source} emptyMessage="داده‌ای وجود ندارد." columns={sourceColumns} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">دستگاه‌ها (Devices)</h2>
        <DataTable rows={data.devices} getRowKey={(row) => row.device} emptyMessage="داده‌ای وجود ندارد." columns={deviceColumns} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">کشورها (Countries)</h2>
        <DataTable rows={data.countries} getRowKey={(row) => row.country} emptyMessage="داده‌ای وجود ندارد." columns={countryColumns} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar filename="acquisition" jsonData={data} csvRows={data.landingPages} />
      </section>
    </>
  );
}
