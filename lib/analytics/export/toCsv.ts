/** Single CSV serializer every dashboard export button reuses — no per-page reimplementation. */
export function toCsv(rows: Record<string, string | number | boolean | null>[]): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | boolean | null): string => {
    const text = value === null ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ];

  return lines.join("\n");
}
