"use client";

import FilterableDataTable from "@/components/dashboard/FilterableDataTable";
import type { DataTableColumn } from "@/components/dashboard/DataTable";
import type { SearchQueryMetric, SearchPageMetric } from "@/lib/analytics/search/types";
import type { QueryMoverMetric } from "@/lib/analytics/search/searchIntelligenceTypes";

/**
 * Column configs (with their `render` functions) and the FilterableDataTable
 * calls that use them must live inside a Client Component — FilterableDataTable
 * is "use client", and a Server Component (page.tsx) cannot pass functions to
 * it across the Server→Client boundary. This component only ever receives
 * plain data (rows/emptyMessage) from the page.
 */

const percent = (value: number) => `${(value * 100).toFixed(1)}٪`;

const queryColumns: DataTableColumn<SearchQueryMetric>[] = [
  { key: "query", label: "عبارت جستجو", render: (row) => row.query },
  { key: "clicks", label: "کلیک", render: (row) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row) => row.impressions },
  { key: "ctr", label: "CTR", render: (row) => percent(row.ctr) },
  { key: "averagePosition", label: "جایگاه", render: (row) => row.averagePosition.toFixed(1) },
];
const queryGetSortValue = (row: SearchQueryMetric, key: string) =>
  key === "query" ? row.query : key === "clicks" ? row.clicks : key === "impressions" ? row.impressions : key === "ctr" ? row.ctr : row.averagePosition;

type TopQueriesTableProps = { rows: SearchQueryMetric[]; emptyMessage: string };

export function TopQueriesTable({ rows, emptyMessage }: TopQueriesTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={queryColumns}
      getRowKey={(row) => row.query}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.query}
      getSortValue={queryGetSortValue}
      searchPlaceholder="جستجوی عبارت..."
    />
  );
}

const pageColumns: DataTableColumn<SearchPageMetric>[] = [
  { key: "page", label: "صفحه", render: (row) => row.page },
  { key: "clicks", label: "کلیک", render: (row) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row) => row.impressions },
  { key: "ctr", label: "CTR", render: (row) => percent(row.ctr) },
  { key: "averagePosition", label: "جایگاه", render: (row) => row.averagePosition.toFixed(1) },
];
const pageGetSortValue = (row: SearchPageMetric, key: string) =>
  key === "page" ? row.page : key === "clicks" ? row.clicks : key === "impressions" ? row.impressions : key === "ctr" ? row.ctr : row.averagePosition;

type TopPagesTableProps = { rows: SearchPageMetric[]; emptyMessage: string };

export function TopPagesTable({ rows, emptyMessage }: TopPagesTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={pageColumns}
      getRowKey={(row) => row.page}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.page}
      getSortValue={pageGetSortValue}
      searchPlaceholder="جستجوی صفحه..."
    />
  );
}

const moverColumns: DataTableColumn<QueryMoverMetric>[] = [
  { key: "query", label: "عبارت جستجو", render: (row) => row.query },
  { key: "clicks", label: "کلیک (فعلی)", render: (row) => row.clicks },
  { key: "previousClicks", label: "کلیک (قبلی)", render: (row) => row.previousClicks },
  { key: "deltaClicks", label: "تغییر", render: (row) => (row.deltaClicks > 0 ? `+${row.deltaClicks}` : row.deltaClicks) },
  {
    key: "percentChange",
    label: "درصد تغییر",
    render: (row) => (row.percentChange === null ? "—" : `${row.percentChange > 0 ? "+" : ""}${row.percentChange.toFixed(0)}٪`),
  },
];
const moverGetSortValue = (row: QueryMoverMetric, key: string) =>
  key === "query" ? row.query : key === "clicks" ? row.clicks : key === "previousClicks" ? row.previousClicks : key === "deltaClicks" ? row.deltaClicks : row.percentChange ?? 0;

type MoverTableProps = { rows: QueryMoverMetric[]; emptyMessage: string };

export function MoverTable({ rows, emptyMessage }: MoverTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={moverColumns}
      getRowKey={(row) => row.query}
      emptyMessage={emptyMessage}
      getSearchText={(row) => row.query}
      getSortValue={moverGetSortValue}
    />
  );
}
