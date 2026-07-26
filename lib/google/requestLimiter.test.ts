import { describe, expect, it } from "vitest";
import { limitedRequest } from "./requestLimiter";

/** Deferred helper so a test can control exactly when a queued task finishes. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

/** Drains pending microtasks so async continuations (await acquire(), etc.) have a chance to run before we inspect state. */
async function flushMicrotasks(times = 5): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

describe("limitedRequest", () => {
  it("never runs more than 5 tasks concurrently, queuing the rest until a slot frees up", async () => {
    const TASK_COUNT = 8;
    const gates = Array.from({ length: TASK_COUNT }, () => deferred<void>());
    let concurrentlyRunning = 0;
    let maxObservedConcurrency = 0;
    const started: boolean[] = new Array(TASK_COUNT).fill(false);

    const runs = gates.map((gate, index) =>
      limitedRequest(async () => {
        started[index] = true;
        concurrentlyRunning += 1;
        maxObservedConcurrency = Math.max(maxObservedConcurrency, concurrentlyRunning);
        await gate.promise;
        concurrentlyRunning -= 1;
        return index;
      })
    );

    // Let every immediately-runnable task actually start.
    await flushMicrotasks();

    expect(started.filter(Boolean).length).toBe(5);
    expect(started.slice(5)).toEqual([false, false, false]);

    // Release one running task — exactly one queued task should start next.
    gates[0].resolve();
    await flushMicrotasks();
    expect(started[5]).toBe(true);
    expect(started[6]).toBe(false);
    expect(started[7]).toBe(false);

    gates.slice(1).forEach((gate) => gate.resolve());
    const results = await Promise.all(runs);

    expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(maxObservedConcurrency).toBeLessThanOrEqual(5);
  });

  it("releases the slot even when the task rejects, so later queued tasks still run", async () => {
    const failing = limitedRequest(async () => {
      throw new Error("boom");
    });

    await expect(failing).rejects.toThrow("boom");

    const after = await limitedRequest(async () => "ok");
    expect(after).toBe("ok");
  });

  it("returns each task's own resolved value", async () => {
    const [a, b, c] = await Promise.all([
      limitedRequest(async () => 1),
      limitedRequest(async () => "two"),
      limitedRequest(async () => ({ three: true })),
    ]);

    expect(a).toBe(1);
    expect(b).toBe("two");
    expect(c).toEqual({ three: true });
  });
});
