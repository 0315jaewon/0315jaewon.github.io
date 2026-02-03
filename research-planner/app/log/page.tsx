"use client";

export const dynamic = "force-static";

import { useState } from "react";
import LogEditor from "../../components/LogEditor";
import WeeklySummary from "../../components/WeeklySummary";
import { getWeekStartMonday, toISODate } from "../../lib/utils";

export default function LogPage() {
  const [weekStart, setWeekStart] = useState(() => toISODate(getWeekStartMonday(new Date())));

  const shiftWeek = (delta: number) => {
    const start = new Date(weekStart);
    start.setDate(start.getDate() + delta * 7);
    setWeekStart(toISODate(start));
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Log</h2>
          <p className="text-sm text-ink-600">Keep a lightweight research log.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="rounded-full border border-sand-200 px-3 py-1" onClick={() => shiftWeek(-1)}>
            Prev
          </button>
          <span className="text-ink-700">Week of {weekStart}</span>
          <button className="rounded-full border border-sand-200 px-3 py-1" onClick={() => shiftWeek(1)}>
            Next
          </button>
        </div>
      </section>
      <LogEditor />
      <WeeklySummary weekStartISO={weekStart} />
    </div>
  );
}
