"use client";

import { useState, useTransition } from "react";
import { checkSiteExternalLinksAction } from "@/app/dashboard/site-health/actions";
import type { ExternalLinkCheckResult } from "@/lib/analytics/site/checkExternalLinks";
import DataTable from "@/components/dashboard/DataTable";

export default function ExternalLinkChecker() {
  const [results, setResults] = useState<ExternalLinkCheckResult[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const runCheck = () => {
    startTransition(async () => {
      const data = await checkSiteExternalLinksAction();
      setResults(data);
    });
  };

  return (
    <div>
      <button type="button" className="dashboard-button" disabled={isPending} onClick={runCheck}>
        {isPending ? "در حال بررسی..." : "بررسی لینک‌های خارجی"}
      </button>

      {results !== null ? (
        <div className="dashboard-section">
          <DataTable
            rows={results}
            getRowKey={(row, index) => `${row.url}-${index}`}
            emptyMessage="لینک خارجی‌ای برای بررسی وجود ندارد."
            columns={[
              { key: "url", label: "URL", render: (row) => row.url },
              { key: "status", label: "وضعیت HTTP", render: (row) => row.status ?? "—" },
              { key: "ok", label: "نتیجه", render: (row) => (row.ok ? "سالم" : "مشکل‌دار") },
              { key: "error", label: "خطا", render: (row) => row.error ?? "—" },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
