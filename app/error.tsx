"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="editorial-space">
      <div className="container reading">
        <h1 className="display">مشکلی پیش آمد.</h1>
        <button className="btn btn-primary" onClick={reset}>تلاش دوباره</button>
      </div>
    </main>
  );
}
