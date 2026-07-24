"use client";

import FilterableDataTable from "@/components/dashboard/FilterableDataTable";
import type { DataTableColumn } from "@/components/dashboard/DataTable";
import type { OpportunityItem } from "@/lib/analytics/growth/opportunityScoring";
import type { ContentRankingItem } from "@/lib/analytics/growth/contentRanking";

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
