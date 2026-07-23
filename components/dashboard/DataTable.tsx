import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T, index: number) => string;
  emptyMessage: string;
};

/**
 * The one table renderer every "list of articles" section in the
 * dashboard uses (best/worst articles, missing-field lists, duplicate
 * groups, broken links, ...) — a single implementation, configured per
 * section via `columns`, instead of one bespoke `<table>` per section.
 */
export default function DataTable<T>({ rows, columns, getRowKey, emptyMessage }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
