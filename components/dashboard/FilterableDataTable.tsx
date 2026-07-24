"use client";

import { useMemo, useState } from "react";
import DataTable, { type DataTableColumn } from "./DataTable";

type FilterableDataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T, index: number) => string;
  emptyMessage: string;
  /** Plain text pulled from the row for the search box to match against (usually the query/page string plus any other searchable field). */
  getSearchText: (row: T) => string;
  searchPlaceholder?: string;
  /** Numeric/comparable value per column key, used for the sort dropdown. Omit a key to leave that column unsortable. */
  getSortValue?: (row: T, columnKey: string) => number | string;
  defaultSortKey?: string;
};

/**
 * Search-Intelligence's client-side search/sort wrapper (item 19) around
 * the shared, plain server-rendered DataTable — `DataTable` itself stays
 * untouched (its `label` is a plain string, not something a sortable
 * header button could render into), so this adds a toolbar above it
 * instead of changing DataTable's contract. Reusable by any later phase
 * that needs the same "search box + sort" behavior on a data table.
 */
export default function FilterableDataTable<T>({
  rows,
  columns,
  getRowKey,
  emptyMessage,
  getSearchText,
  searchPlaceholder = "جستجو...",
  getSortValue,
  defaultSortKey,
}: FilterableDataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>(defaultSortKey ?? "");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => getSearchText(row).toLowerCase().includes(needle));
  }, [rows, query, getSearchText]);

  const sorted = useMemo(() => {
    if (!getSortValue || !sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const valueA = getSortValue(a, sortKey);
      const valueB = getSortValue(b, sortKey);
      const comparison =
        typeof valueA === "number" && typeof valueB === "number" ? valueA - valueB : String(valueA).localeCompare(String(valueB), "fa");
      return sortDir === "asc" ? comparison : -comparison;
    });
    return copy;
  }, [filtered, sortKey, sortDir, getSortValue]);

  return (
    <div className="dashboard-filterable-table">
      <div className="dashboard-table-toolbar" data-print-hide>
        <input
          type="text"
          className="dashboard-search-input"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {getSortValue ? (
          <div className="dashboard-sort-controls">
            <label className="dashboard-sort-label">
              مرتب‌سازی:
              <select className="dashboard-sort-select" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                <option value="">بدون ترتیب</option>
                {columns.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="dashboard-range-button" onClick={() => setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))}>
              {sortDir === "asc" ? "صعودی ▲" : "نزولی ▼"}
            </button>
          </div>
        ) : null}
      </div>
      <DataTable rows={sorted} columns={columns} getRowKey={getRowKey} emptyMessage={query ? "با این جستجو موردی یافت نشد." : emptyMessage} />
    </div>
  );
}
