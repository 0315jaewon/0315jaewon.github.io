"use client";

import { useMemo, useState } from "react";
import { useAppStore, getWeekPlan } from "../lib/store";
import { minutesToLabel } from "../lib/utils";

function withinRange(dateISO: string, start: Date, end: Date) {
  const date = new Date(dateISO);
  return date >= start && date < end;
}

export default function WeeklySummary({ weekStartISO }: { weekStartISO: string }) {
  const { state } = useAppStore();
  const plan = getWeekPlan(state, weekStartISO);
  const [summary, setSummary] = useState("");

  const weekRange = useMemo(() => {
    const start = new Date(weekStartISO);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  }, [weekStartISO]);

  const generate = () => {
    const completedBlocks = plan.timeBlocks.filter((block) => block.done);
    const doneTasks = state.tasks.filter((task) => task.status === "done");
    const weekLogs = state.logs.filter((log) => withinRange(log.createdAtISO, weekRange.start, weekRange.end));

    const lines = [
      `Weekly Summary (${weekStartISO})`,
      `Completed blocks: ${completedBlocks.length}`,
      ...completedBlocks.map((block) => `- ${block.title} (${minutesToLabel(block.durationMinutes)})`),
      "",
      `Tasks done: ${doneTasks.length}`,
      ...doneTasks.map((task) => `- ${task.title}`),
      "",
      `Log highlights: ${weekLogs.length}`,
      ...weekLogs.map((log) => `- ${log.title ?? log.text.slice(0, 60)}`)
    ];

    setSummary(lines.join("\n"));
  };

  const copy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // ignore
    }
  };

  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Weekly Summary</h3>
          <p className="text-xs text-ink-600">Draft based on blocks, tasks, and logs.</p>
        </div>
        <button
          type="button"
          onClick={generate}
          className="rounded-full bg-ink-900 px-3 py-1 text-xs text-white"
        >
          Generate
        </button>
      </div>
      <textarea
        className="mt-3 min-h-[160px] w-full rounded-2xl border border-sand-200 px-3 py-2 text-xs"
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-sand-200 px-3 py-1 text-xs"
        >
          Copy to clipboard
        </button>
      </div>
    </section>
  );
}
