"use client";

import FilterableDataTable from "@/components/dashboard/FilterableDataTable";
import type { DataTableColumn } from "@/components/dashboard/DataTable";
import type { RankedChange } from "@/lib/analytics/history/rankChanges";
import type { DecayEvent, RecoveryEvent } from "@/lib/analytics/history/streaks";
import type { TimelineEntry } from "@/lib/analytics/history/timeline";

/**
 * The column configs (with their `render` functions) and the FilterableDataTable
 * calls that use them must live inside a Client Component — FilterableDataTable
 * is "use client", and a Next.js Server Component (app/dashboard/history/insights/page.tsx)
 * cannot pass functions to it across the Server→Client boundary. Defining and
 * using the functions entirely within this client module (rather than passing
 * them in as props) keeps every table serializable at the boundary: this
 * component only ever receives plain data (rows/emptyMessage) from the page.
 */

const rankedChangeColumns: DataTableColumn<RankedChange>[] = [
  { key: "label", label: "معیار", render: (row) => row.label },
  { key: "fromLabel", label: "از", render: (row) => row.fromLabel },
  { key: "toLabel", label: "به", render: (row) => row.toLabel },
  { key: "current", label: "مقدار فعلی", render: (row) => Math.round(row.comparison.current * 100) / 100 },
  { key: "previous", label: "مقدار قبلی", render: (row) => (row.comparison.previous !== null ? Math.round(row.comparison.previous * 100) / 100 : "-") },
  {
    key: "percentChange",
    label: "درصد تغییر",
    render: (row) => (row.comparison.percentChange !== null ? `${row.comparison.percentChange.toFixed(1)}٪` : "-"),
  },
];

type RankedChangeTableProps = {
  rows: RankedChange[];
  emptyMessage: string;
};

export function RankedChangeTable({ rows, emptyMessage }: RankedChangeTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={rankedChangeColumns}
      getRowKey={(row) => row.key}
      getSearchText={(row) => row.label}
      getSortValue={(row, key) =>
        key === "percentChange" ? row.comparison.percentChange ?? 0 : key === "current" ? row.comparison.current : row.label
      }
      defaultSortKey="percentChange"
      emptyMessage={emptyMessage}
    />
  );
}

const streakColumns: DataTableColumn<DecayEvent | RecoveryEvent>[] = [
  { key: "label", label: "معیار", render: (row) => row.label },
  { key: "streakLength", label: "طول بازه پیاپی", render: (row) => row.streakLength },
  { key: "first", label: "مقدار ابتدا", render: (row) => row.values[0]?.value ?? "-" },
  { key: "last", label: "مقدار انتها", render: (row) => row.values[row.values.length - 1]?.value ?? "-" },
];

type StreakTableProps = {
  rows: (DecayEvent | RecoveryEvent)[];
  emptyMessage: string;
};

export function StreakTable({ rows, emptyMessage }: StreakTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={streakColumns}
      getRowKey={(row) => row.key}
      getSearchText={(row) => row.label}
      getSortValue={(row, key) => (key === "streakLength" ? row.streakLength : row.label)}
      defaultSortKey="streakLength"
      emptyMessage={emptyMessage}
    />
  );
}

const timelineColumns: DataTableColumn<TimelineEntry>[] = [
  { key: "timestamp", label: "تاریخ", render: (row) => row.timestamp.slice(0, 10) },
  {
    key: "type",
    label: "نوع",
    render: (row) => (row.type === "decay" ? "افت پیاپی" : row.type === "recovery" ? "بهبود پیاپی" : "جهش تک‌روزه"),
  },
  { key: "label", label: "معیار", render: (row) => row.label },
  { key: "description", label: "توضیح", render: (row) => row.description },
];

type TimelineTableProps = {
  rows: TimelineEntry[];
  emptyMessage: string;
};

export function TimelineTable({ rows, emptyMessage }: TimelineTableProps) {
  return (
    <FilterableDataTable
      rows={rows}
      columns={timelineColumns}
      getRowKey={(row) => row.id}
      getSearchText={(row) => `${row.label} ${row.description}`}
      getSortValue={(row, key) => (key === "timestamp" ? new Date(row.timestamp).getTime() : row.label)}
      defaultSortKey="timestamp"
      emptyMessage={emptyMessage}
    />
  );
}
