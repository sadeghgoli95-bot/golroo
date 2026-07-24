import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import BarChart from "@/components/dashboard/BarChart";
import TrendChart from "@/components/dashboard/TrendChart";
import DataTable from "@/components/dashboard/DataTable";
import ExportBar from "@/components/dashboard/ExportBar";
import { TopQueriesTable, TopPagesTable, MoverTable } from "./SearchIntelligenceTables";
import { getSearchIntelligenceSafely } from "@/lib/analytics/safeGoogleMetrics";
import { compareMetricValue } from "@/lib/analytics/comparison";
import type { DateRange } from "@/lib/analytics/types";
import type { SearchQueryMetric, SearchPageMetric } from "@/lib/analytics/search/types";
import type {
  TrendingQueryMetric,
  QueryCannibalization,
  PageCannibalization,
  SearchDimensionMetric,
  IntentBreakdownItem,
} from "@/lib/analytics/search/searchIntelligenceTypes";

const LAST_30_DAYS: DateRange = { preset: "last30Days", start: null, end: null };

const percent = (value: number) => `${(value * 100).toFixed(1)}٪`;

const queryColumns = [
  { key: "query", label: "عبارت جستجو", render: (row: SearchQueryMetric) => row.query },
  { key: "clicks", label: "کلیک", render: (row: SearchQueryMetric) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row: SearchQueryMetric) => row.impressions },
  { key: "ctr", label: "CTR", render: (row: SearchQueryMetric) => percent(row.ctr) },
  { key: "averagePosition", label: "جایگاه", render: (row: SearchQueryMetric) => row.averagePosition.toFixed(1) },
];

const pageColumns = [
  { key: "page", label: "صفحه", render: (row: SearchPageMetric) => row.page },
  { key: "clicks", label: "کلیک", render: (row: SearchPageMetric) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row: SearchPageMetric) => row.impressions },
  { key: "ctr", label: "CTR", render: (row: SearchPageMetric) => percent(row.ctr) },
  { key: "averagePosition", label: "جایگاه", render: (row: SearchPageMetric) => row.averagePosition.toFixed(1) },
];

const trendingColumns = [
  { key: "query", label: "عبارت جستجو", render: (row: TrendingQueryMetric) => row.query },
  { key: "impressions", label: "نمایش (فعلی)", render: (row: TrendingQueryMetric) => row.impressions },
  { key: "previousImpressions", label: "نمایش (قبلی)", render: (row: TrendingQueryMetric) => row.previousImpressions },
  {
    key: "impressionGrowthPercent",
    label: "رشد نمایش",
    render: (row: TrendingQueryMetric) => (row.impressionGrowthPercent === null ? "—" : `+${row.impressionGrowthPercent.toFixed(0)}٪`),
  },
];

const dimensionColumns = [
  { key: "label", label: "برچسب", render: (row: SearchDimensionMetric) => row.label },
  { key: "clicks", label: "کلیک", render: (row: SearchDimensionMetric) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row: SearchDimensionMetric) => row.impressions },
  { key: "ctr", label: "CTR", render: (row: SearchDimensionMetric) => percent(row.ctr) },
  { key: "averagePosition", label: "جایگاه", render: (row: SearchDimensionMetric) => row.averagePosition.toFixed(1) },
];

const queryCannibalizationColumns = [
  { key: "query", label: "عبارت جستجو", render: (row: QueryCannibalization) => row.query },
  { key: "pageCount", label: "تعداد صفحه رقیب", render: (row: QueryCannibalization) => row.pages.length },
  { key: "totalImpressions", label: "مجموع نمایش", render: (row: QueryCannibalization) => row.totalImpressions },
  { key: "pages", label: "صفحات", render: (row: QueryCannibalization) => row.pages.map((p) => p.page).join("، ") },
];

const pageCannibalizationColumns = [
  { key: "page", label: "صفحه", render: (row: PageCannibalization) => row.page },
  { key: "overlappingPage", label: "صفحه رقیب", render: (row: PageCannibalization) => row.overlappingPage },
  { key: "sharedQueries", label: "عبارت‌های مشترک", render: (row: PageCannibalization) => row.sharedQueries.length },
  { key: "sample", label: "نمونه عبارت", render: (row: PageCannibalization) => row.sharedQueries[0]?.query ?? "—" },
];

const intentColumns = [
  { key: "label", label: "نوع نیت", render: (row: IntentBreakdownItem) => row.label },
  { key: "queryCount", label: "تعداد عبارت", render: (row: IntentBreakdownItem) => row.queryCount },
  { key: "clicks", label: "کلیک", render: (row: IntentBreakdownItem) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row: IntentBreakdownItem) => row.impressions },
];

export default async function SearchIntelligencePage() {
  const search = await getSearchIntelligenceSafely(LAST_30_DAYS);

  if (!search.data) {
    return (
      <>
        <DashboardHeader title="هوش جستجو" description="تحلیل عمیق عملکرد جستجو در Search Console (۳۰ روز اخیر در مقابل ۳۰ روز قبل)" />
        <div className="dashboard-empty-state">
          <p>Search Console متصل نیست{search.error ? ` — ${search.error}` : "."}</p>
        </div>
      </>
    );
  }

  const data = search.data;

  return (
    <>
      <DashboardHeader title="هوش جستجو" description="تحلیل عمیق عملکرد جستجو در Search Console (۳۰ روز اخیر در مقابل ۳۰ روز قبل)" />

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">شاخص‌های کلی</h2>
        <div className="dashboard-grid">
          <DashboardCard label="کلیک‌ها" value={String(data.clicks.current)} comparison={compareMetricValue(data.clicks)} />
          <DashboardCard label="نمایش‌ها" value={String(data.impressions.current)} comparison={compareMetricValue(data.impressions)} />
          <DashboardCard label="CTR" value={percent(data.ctr.current)} comparison={compareMetricValue(data.ctr)} />
          <DashboardCard
            label="میانگین جایگاه"
            value={data.averagePosition.current.toFixed(1)}
            comparison={compareMetricValue(data.averagePosition)}
            invertColor
          />
          <DashboardCard
            label="سهم کلیک برند"
            value={data.brandClicksShare === null ? "—" : percent(data.brandClicksShare)}
            hint="سهم کلیک‌های عبارت‌های حاوی نام برند از کل کلیک‌ها"
          />
        </div>
      </section>

      {data.insights.length > 0 ? (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">فرصت‌ها و اقدامات پیشنهادی</h2>
          <ul className="dashboard-insights-list">
            {data.insights.map((insight) => (
              <li key={insight.id} className={`dashboard-insight dashboard-insight-${insight.severity}`}>
                {insight.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">پرکلیک‌ترین عبارت‌های جستجو (۲۵ مورد برتر)</h2>
        <TopQueriesTable rows={data.topQueries} emptyMessage="داده‌ای وجود ندارد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">پربازدیدترین صفحات در جستجو (۲۵ مورد برتر)</h2>
        <TopPagesTable rows={data.topPages} emptyMessage="داده‌ای وجود ندارد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">عبارت‌های برنده (رشد کلیک نسبت به دوره قبل)</h2>
        <MoverTable rows={data.winningKeywords} emptyMessage="عبارت رو به رشدی یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">عبارت‌های بازنده (افت کلیک نسبت به دوره قبل)</h2>
        <MoverTable rows={data.losingKeywords} emptyMessage="عبارت رو به افتی یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">عبارت‌های جدید (فقط در دوره فعلی)</h2>
        <DataTable rows={data.newQueries} columns={queryColumns} getRowKey={(row) => row.query} emptyMessage="عبارت جدیدی یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">عبارت‌های ازدست‌رفته (فقط در دوره قبل)</h2>
        <DataTable rows={data.lostQueries} columns={queryColumns} getRowKey={(row) => row.query} emptyMessage="عبارت ازدست‌رفته‌ای یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">عبارت‌های در حال ترند (سریع‌ترین رشد نمایش)</h2>
        <DataTable rows={data.trendingQueries} columns={trendingColumns} getRowKey={(row) => row.query} emptyMessage="عبارت ترندی یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحات نزدیک به صفحه اول (جایگاه ۱۱ تا ۲۰)</h2>
        <DataTable rows={data.pagesNearTop10} columns={pageColumns} getRowKey={(row) => row.page} emptyMessage="صفحه‌ای در این بازه یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">نمایش بالا / CTR پایین</h2>
        <DataTable rows={data.highImpressionLowCtrPages} columns={pageColumns} getRowKey={(row) => row.page} emptyMessage="موردی یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">CTR بالا / نمایش کم (فرصت‌های پنهان)</h2>
        <DataTable rows={data.highCtrLowImpressionPages} columns={pageColumns} getRowKey={(row) => row.page} emptyMessage="موردی یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تداخل داخلی روی عبارت جستجو (Query Cannibalization)</h2>
        <DataTable
          rows={data.queryCannibalization}
          columns={queryCannibalizationColumns}
          getRowKey={(row) => row.query}
          emptyMessage="تداخلی شناسایی نشد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تداخل داخلی بین صفحات (Page Cannibalization)</h2>
        <DataTable
          rows={data.pageCannibalization}
          columns={pageCannibalizationColumns}
          getRowKey={(row) => `${row.page}-${row.overlappingPage}`}
          emptyMessage="تداخلی شناسایی نشد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">عبارت‌های برند</h2>
        <DataTable rows={data.brandQueries} columns={queryColumns} getRowKey={(row) => row.query} emptyMessage="عبارت برندی یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">عبارت‌های غیر برند</h2>
        <DataTable rows={data.nonBrandQueries} columns={queryColumns} getRowKey={(row) => row.query} emptyMessage="عبارت غیر برندی یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">دسته‌بندی نیت جستجو (Search Intent)</h2>
        <DataTable rows={data.intentBreakdown} columns={intentColumns} getRowKey={(row) => row.intent} emptyMessage="داده‌ای وجود ندارد." />
        <BarChart data={data.intentBreakdown.map((item) => ({ label: item.label, count: item.clicks }))} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع کشور</h2>
        <DataTable rows={data.countryBreakdown} columns={dimensionColumns} getRowKey={(row) => row.label} emptyMessage="داده‌ای وجود ندارد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع دستگاه</h2>
        <DataTable rows={data.deviceBreakdown} columns={dimensionColumns} getRowKey={(row) => row.label} emptyMessage="داده‌ای وجود ندارد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">نوع نمایش در نتایج جستجو (Search Appearance)</h2>
        <DataTable
          rows={data.searchAppearanceBreakdown}
          columns={dimensionColumns}
          getRowKey={(row) => row.label}
          emptyMessage="داده‌ای وجود ندارد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">روند کلیک و نمایش و CTR و جایگاه</h2>
        <div className="dashboard-trend-grid">
          <TrendChart title="روند کلیک‌ها" points={data.clicksTrend} />
          <TrendChart title="روند نمایش‌ها" points={data.impressionsTrend} />
          <TrendChart title="روند CTR (٪)" points={data.ctrTrend} />
          <TrendChart title="روند میانگین جایگاه" points={data.positionTrend} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">روند رشد عبارت‌ها و صفحات فعال (بازه‌های هفتگی)</h2>
        <div className="dashboard-trend-grid">
          <TrendChart title="رشد تعداد عبارت‌های فعال" points={data.queryGrowthTrend} />
          <TrendChart title="رشد تعداد صفحات فعال" points={data.pageGrowthTrend} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="search-intelligence"
          jsonData={data}
          csvRows={data.topQueries.map((row) => ({
            query: row.query,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            averagePosition: row.averagePosition,
          }))}
        />
      </section>
    </>
  );
}
