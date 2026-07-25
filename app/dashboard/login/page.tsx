"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.error === "invalid-password") setError("رمز عبور اشتباه است");
        else if (data.error === "too-many-requests") setError("تعداد تلاش‌ها زیاد بود، کمی صبر کنید");
        else if (data.error === "dashboard-password-not-configured") setError("DASHBOARD_PASSWORD تنظیم نشده است");
        else setError("خطا در ورود");
        setLoading(false);
        return;
      }

      const from = searchParams.get("from") || "/dashboard";
      router.replace(from);
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-login">
      <form onSubmit={handleSubmit} className="dashboard-login-form">
        <h1 className="dashboard-login-title">ورود به داشبورد</h1>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="رمز عبور"
          className="dashboard-login-input"
          autoFocus
        />
        {error && <p className="dashboard-login-error">{error}</p>}
        <button type="submit" disabled={loading} className="dashboard-button">
          {loading ? "در حال ورود…" : "ورود"}
        </button>
      </form>
    </div>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
