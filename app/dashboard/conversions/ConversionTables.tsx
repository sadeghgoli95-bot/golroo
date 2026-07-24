"use client";

import FilterableDataTable from "@/components/dashboard/FilterableDataTable";
import type { DataTableColumn } from "@/components/dashboard/DataTable";
import type { ConversionRateBreakdownRow, ContentAttributionRow } from "@/lib/analytics/conversion/types";

/**
 * Column configs (with their `render` functions) and the FilterableDataTable
 * calls that use them must live inside a Client Component — FilterableDataTable
 * is "use client", and a Server Component (page.tsx) cannot pass functions to
 * it across the Server→Client boundary. This component only ever receives
 * plain data (rows/emptyMessage) from the page.
 */

function formatPercent(value: number): string {
  return `${value.toFixed(1)}٪`;
}

const breakdownColumns: DataTableColumn<ConversionRateBreakdownRow>[] = [
  { key: "segment", label: "بخش", render: (row) => row.segment || "(نامشخص)" },
  { key: "sessions", label: "نشست", render: (row) => row.sessions },
  { key: "conversionPageViews", label: "بازدید نوبت‌دهی/تماس", render: (row) => row.conversionPageViews },
  { key: "conversionRate", label: "نرخ تبدیل تقریبی", render: (row) => formatPercent(row.conversionRate) },
];

function breakdownSortValue(row: ConversionRateBreakdownRow, key: string): number | string {
  if (key === "segment") return row.segment;
  if (key === "sessions") return row.sessions;
  if (key === "conversionPageViews") return row.conversionPageViews;
  return row.conversionRate;
}

type BreakdownTableProps = { rows: ConversionRateBreakdownRow[]; emptyMessage: string };

export function BreakdownTable({ rows, emptyMessage }: BreakdownTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={breakdownColumns}
      getRowKey={(row) => row.segment}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.segment}
      getSortValue={breakdownSortValue}
      defaultSortKey="sessions"
    />
  );
}

const contentAttributionColumns: DataTableColumn<ContentAttributionRow>[] = [
  { key: "title", label: "عنوان", render: (row) => row.title },
  { key: "landingSessions", label: "نشست فرود", render: (row) => row.landingSessions },
  { key: "engagementRate", label: "نرخ تعامل", render: (row) => `${(row.engagementRate * 100).toFixed(1)}٪` },
  { key: "bookingLinkCount", label: "لینک به نوبت‌دهی/تماس", render: (row) => row.bookingLinkCount },
  { key: "estimatedScore", label: "امتیاز تخمینی", render: (row) => row.estimatedScore },
];

type ContentAttributionTableProps = { rows: ContentAttributionRow[]; emptyMessage: string };

export function ContentAttributionTable({ rows, emptyMessage }: ContentAttributionTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={contentAttributionColumns}
      getRowKey={(row) => row.slug}
      emptyMessage={emptyMessage}
      getSearchText={(row) => `${row.title} ${row.slug}`}
      getSortValue={(row, key) => {
        if (key === "title") return row.title;
        if (key === "landingSessions") return row.landingSessions;
        if (key === "engagementRate") return row.engagementRate;
        if (key === "bookingLinkCount") return row.bookingLinkCount;
        return row.estimatedScore;
      }}
      defaultSortKey="estimatedScore"
    />
  );
}
