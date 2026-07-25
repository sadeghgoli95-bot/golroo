"use client";

import FilterableDataTable from "@/components/dashboard/FilterableDataTable";
import type { DataTableColumn } from "@/components/dashboard/DataTable";
import type { OpportunityItem } from "@/lib/analytics/growth/opportunityScoring";
import type { ContentRankingItem } from "@/lib/analytics/growth/contentRanking";
import type { VisibilityChange } from "@/lib/analytics/growth/visibilityTrends";
import type { NeedsUpdatingItem } from "@/lib/analytics/growth/contentFreshness";
import type { GrowthPotentialEstimate } from "@/lib/analytics/growth/growthPotential";
import type { PageSignal } from "@/lib/analytics/growth/pageSignals";

/**
 * Column configs (with their `render` functions) and the FilterableDataTable
 * calls that use them must live inside a Client Component — FilterableDataTable
 * is "use client", and a Server Component (page.tsx) cannot pass functions to
 * it across the Server→Client boundary. This component only ever receives
 * plain data (rows/emptyMessage) from the page.
 */

const opportunityColumns: DataTableColumn<OpportunityItem>[] = [
  { key: "title", label: "مقاله", render: (row) => row.title },
  { key: "averagePosition", label: "جایگاه فعلی", render: (row) => row.averagePosition.toFixed(1) },
  { key: "impressions", label: "نمایش (۳۰ روز)", render: (row) => row.impressions },
  { key: "clicks", label: "کلیک فعلی (Impact)", render: (row) => row.impactScore },
  { key: "opportunityScore", label: "امتیاز فرصت", render: (row) => row.opportunityScore },
  { key: "priorityScore", label: "امتیاز اولویت", render: (row) => row.priorityScore },
];

type OpportunityTableProps = { rows: OpportunityItem[]; emptyMessage: string };

export function OpportunityTable({ rows, emptyMessage }: OpportunityTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={opportunityColumns}
      getRowKey={(row) => row.slug}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.title}
      getSortValue={(row, key) => (row as unknown as Record<string, number>)[key] ?? 0}
      defaultSortKey="priorityScore"
    />
  );
}

const rankingColumns: DataTableColumn<ContentRankingItem>[] = [
  { key: "title", label: "مقاله", render: (row) => row.title },
  { key: "seoScore", label: "امتیاز سئو", render: (row) => row.seoScore },
  { key: "clicks", label: "کلیک", render: (row) => row.clicks ?? "مشاهده نشده" },
  { key: "sessions", label: "نشست", render: (row) => row.sessions ?? "مشاهده نشده" },
  { key: "performanceScore", label: "امتیاز عملکرد", render: (row) => row.performanceScore },
];

type ContentRankingTableProps = { rows: ContentRankingItem[]; emptyMessage: string };

export function ContentRankingTable({ rows, emptyMessage }: ContentRankingTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={rankingColumns}
      getRowKey={(row) => row.slug}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.title}
      getSortValue={(row, key) => (row as unknown as Record<string, number>)[key] ?? 0}
      defaultSortKey="performanceScore"
    />
  );
}

/** Suggested next action for a real visibility change — a plain, deterministic template over the real comparison numbers already computed by visibilityTrends.ts, not a new score. */
function visibilityAction(row: VisibilityChange): string {
  const lost = Math.abs(row.comparison.difference ?? 0);
  return row.comparison.trend === "down"
    ? `بررسی و به‌روزرسانی محتوا — افت ${lost} کلیک واقعی نسبت به دوره قبل`
    : `حفظ روند فعلی — رشد ${row.comparison.difference ?? 0} کلیک واقعی نسبت به دوره قبل`;
}

const visibilityColumns: DataTableColumn<VisibilityChange>[] = [
  { key: "title", label: "مقاله", render: (row) => row.title },
  { key: "current", label: "کلیک فعلی", render: (row) => row.comparison.current },
  { key: "previous", label: "کلیک دوره قبل", render: (row) => row.comparison.previous ?? "—" },
  {
    key: "change",
    label: "تغییر",
    render: (row) => (row.comparison.percentChange !== null ? `${row.comparison.percentChange.toFixed(1)}٪` : String(row.comparison.difference ?? "—")),
  },
  { key: "action", label: "اقدام پیشنهادی", render: visibilityAction },
];

type VisibilityChangeTableProps = { rows: VisibilityChange[]; emptyMessage: string };

/** Shared by both "losing visibility" (risk) and "improving visibility" (growth) sections — same shape, sortable by real click change. */
export function VisibilityChangeTable({ rows, emptyMessage }: VisibilityChangeTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={visibilityColumns}
      getRowKey={(row) => row.slug}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.title}
      getSortValue={(row, key) => {
        if (key === "current") return row.comparison.current;
        if (key === "previous") return row.comparison.previous ?? 0;
        if (key === "change") return row.comparison.difference ?? 0;
        return 0;
      }}
      defaultSortKey="change"
    />
  );
}

const needsUpdatingColumns: DataTableColumn<NeedsUpdatingItem>[] = [
  { key: "title", label: "مقاله", render: (row) => row.title },
  { key: "daysSinceUpdate", label: "روز از آخرین به‌روزرسانی (تازگی)", render: (row) => row.daysSinceUpdate },
  { key: "reason", label: "دلیل", render: (row) => row.reason },
];

type NeedsUpdatingTableProps = { rows: NeedsUpdatingItem[]; emptyMessage: string };

/** Sortable by "freshness" (days since last update) — Phase 3 Part 2 requirement 4. */
export function NeedsUpdatingTable({ rows, emptyMessage }: NeedsUpdatingTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={needsUpdatingColumns}
      getRowKey={(row) => row.slug}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.title}
      getSortValue={(row, key) => (row as unknown as Record<string, number>)[key] ?? 0}
      defaultSortKey="daysSinceUpdate"
    />
  );
}

const growthPotentialColumns: DataTableColumn<GrowthPotentialEstimate>[] = [
  { key: "page", label: "صفحه", render: (row) => row.page },
  { key: "currentPosition", label: "جایگاه فعلی", render: (row) => row.currentPosition.toFixed(1) },
  { key: "currentCtr", label: "CTR فعلی", render: (row) => `${(row.currentCtr * 100).toFixed(1)}٪` },
  {
    key: "estimatedClickUplift",
    label: "تخمین کلیک اضافه (جایگاه ۴ تا ۶)",
    render: (row) => (row.estimatedClickUplift !== null ? `+${row.estimatedClickUplift}` : row.insufficientDataReason ?? "داده کافی نیست"),
  },
];

type GrowthPotentialTableProps = { rows: GrowthPotentialEstimate[]; emptyMessage: string };

/** Sortable by "growth potential" (estimated click uplift) — Phase 3 Part 2 requirement 4. */
export function GrowthPotentialTable({ rows, emptyMessage }: GrowthPotentialTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={growthPotentialColumns}
      getRowKey={(row) => row.page}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.page}
      getSortValue={(row, key) => (row as unknown as Record<string, number | null>)[key] ?? 0}
      defaultSortKey="estimatedClickUplift"
    />
  );
}

function impressionsWithoutClicksAction(row: PageSignal): string {
  return `بررسی CTR — نمایش واقعی ${row.impressions.difference ?? 0}+ رشد کرده اما کلیک واقعی همراه آن رشد نکرده؛ عنوان/متا را بازبینی کنید`;
}

const impressionGrowthColumns: DataTableColumn<PageSignal>[] = [
  { key: "title", label: "مقاله", render: (row) => row.title },
  { key: "impressions", label: "نمایش فعلی", render: (row) => row.impressions.current },
  { key: "impressionsChange", label: "تغییر نمایش", render: (row) => (row.impressions.percentChange !== null ? `${row.impressions.percentChange.toFixed(1)}٪` : "—") },
  { key: "clicks", label: "کلیک فعلی", render: (row) => row.clicks.current },
  { key: "clicksChange", label: "تغییر کلیک", render: (row) => (row.clicks.percentChange !== null ? `${row.clicks.percentChange.toFixed(1)}٪` : "—") },
  { key: "action", label: "اقدام پیشنهادی", render: impressionsWithoutClicksAction },
];

type PageSignalTableProps = { rows: PageSignal[]; emptyMessage: string };

export function ImpressionGrowthTable({ rows, emptyMessage }: PageSignalTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={impressionGrowthColumns}
      getRowKey={(row) => row.slug}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.title}
      getSortValue={(row, key) => {
        if (key === "impressions" || key === "impressionsChange") return row.impressions.difference ?? 0;
        if (key === "clicks" || key === "clicksChange") return row.clicks.difference ?? 0;
        return 0;
      }}
      defaultSortKey="impressionsChange"
    />
  );
}

function ctrDropAction(row: PageSignal): string {
  return `بررسی فوری عنوان/متا — CTR واقعی ${row.ctr.percentChange?.toFixed(1) ?? "—"}٪ افت داشته`;
}

const ctrDropColumns: DataTableColumn<PageSignal>[] = [
  { key: "title", label: "مقاله", render: (row) => row.title },
  { key: "ctrCurrent", label: "CTR فعلی", render: (row) => `${(row.ctr.current * 100).toFixed(1)}٪` },
  { key: "ctrPrevious", label: "CTR دوره قبل", render: (row) => (row.ctr.previous !== null ? `${(row.ctr.previous * 100).toFixed(1)}٪` : "—") },
  { key: "ctrChange", label: "تغییر CTR", render: (row) => (row.ctr.percentChange !== null ? `${row.ctr.percentChange.toFixed(1)}٪` : "—") },
  { key: "action", label: "اقدام پیشنهادی", render: ctrDropAction },
];

export function CtrDropTable({ rows, emptyMessage }: PageSignalTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={ctrDropColumns}
      getRowKey={(row) => row.slug}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.title}
      getSortValue={(row, key) => {
        if (key === "ctrChange") return row.ctr.percentChange ?? 0;
        if (key === "ctrCurrent") return row.ctr.current;
        if (key === "ctrPrevious") return row.ctr.previous ?? 0;
        return 0;
      }}
      defaultSortKey="ctrChange"
    />
  );
}
