"use client";

import { useMemo, useState } from "react";
import { useAppStore, getWeekPlan } from "../lib/store";
import { generateId } from "../lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DailyFocus({ weekStartISO }: { weekStartISO: string }) {
  const { state, dispatch } = useAppStore();
  const plan = getWeekPlan(state, weekStartISO);
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay(); // 0=Sun..6=Sat
    return today === 0 ? 6 : today - 1; // 0=Mon..6=Sun
  });
  const [newItem, setNewItem] = useState("");
  const [newPaper, setNewPaper] = useState("");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddPaper, setShowAddPaper] = useState(false);

  const dayData = useMemo(() => plan.dailyGoals[selectedDay], [plan.dailyGoals, selectedDay]);

  const updateDay = (next: typeof dayData) => {
    dispatch({
      type: "UPSERT_WEEK",
      payload: { ...plan, dailyGoals: { ...plan.dailyGoals, [selectedDay]: next } }
    });
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    updateDay({
      ...dayData,
      items: [{ id: generateId(), text: newItem.trim(), done: false }, ...dayData.items]
    });
    setNewItem("");
    setShowAddGoal(false);
  };

  const addPaper = () => {
    if (!newPaper.trim()) return;
    updateDay({
      ...dayData,
      papers: [{ id: generateId(), text: newPaper.trim(), done: false }, ...dayData.papers]
    });
    setNewPaper("");
    setShowAddPaper(false);
  };

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">Daily Focus</h3>
        <div className="flex items-center gap-2">
          <button
            className="day-pill"
            onClick={() => setSelectedDay((prev) => (prev - 1 + 7) % 7)}
            aria-label="Previous day"
          >
            ◀
          </button>
          <span className="rounded-full border border-sand-200 px-3 py-1 text-xs text-ink-700">
            {days[selectedDay]}
          </span>
          <button
            className="day-pill"
            onClick={() => setSelectedDay((prev) => (prev + 1) % 7)}
            aria-label="Next day"
          >
            ▶
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-600">Focus list</p>
            <button
              className="rounded-full border border-sand-200 px-2 py-0.5 text-[11px]"
              onClick={() => setShowAddGoal((prev) => !prev)}
            >
              +
            </button>
          </div>
          {showAddGoal && (
            <div className="mt-2 flex gap-2 rounded-xl border border-dashed border-sand-200 px-3 py-2">
              <input
                className="w-full bg-transparent text-xs text-ink-900 outline-none"
                placeholder="New focus item"
                value={newItem}
                onChange={(event) => setNewItem(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addItem();
                  }
                }}
              />
            </div>
          )}
          <div className="mt-2 space-y-2">
            {dayData.items.length === 0 && <p className="text-xs text-ink-600">No items yet.</p>}
            {dayData.items.map((item) => (
              <label key={item.id} className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs text-ink-700">
                <input
                  type="checkbox"
                  className="check"
                  checked={item.done}
                  onChange={() =>
                    updateDay({
                      ...dayData,
                      items: dayData.items.map((goal) => (goal.id === item.id ? { ...goal, done: !goal.done } : goal))
                    })
                  }
                />
                <span className={item.done ? "line-through text-ink-500" : ""}>{item.text}</span>
                <button
                  className="ml-auto text-xs text-ink-500"
                  onClick={() =>
                    updateDay({
                      ...dayData,
                      items: dayData.items.filter((goal) => goal.id !== item.id)
                    })
                  }
                >
                  Remove
                </button>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-600">Daily progress</p>
          <textarea
            className="mt-2 min-h-[80px] w-full rounded-xl border border-sand-200 px-3 py-2 text-xs"
            placeholder="Progress notes"
            value={dayData.progress}
            onChange={(event) => updateDay({ ...dayData, progress: event.target.value })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-600">Papers to read</p>
            <button
              className="rounded-full border border-sand-200 px-2 py-0.5 text-[11px]"
              onClick={() => setShowAddPaper((prev) => !prev)}
            >
              +
            </button>
          </div>
          {showAddPaper && (
            <div className="mt-2 flex gap-2 rounded-xl border border-dashed border-sand-200 px-3 py-2">
              <input
                className="w-full bg-transparent text-xs text-ink-900 outline-none"
                placeholder="New paper"
                value={newPaper}
                onChange={(event) => setNewPaper(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addPaper();
                  }
                }}
              />
            </div>
          )}
          <div className="mt-2 space-y-2">
            {dayData.papers.length === 0 && <p className="text-xs text-ink-600">No papers yet.</p>}
            {dayData.papers.map((paper) => (
              <label key={paper.id} className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2 text-xs text-ink-700">
                <input
                  type="checkbox"
                  className="check"
                  checked={paper.done}
                  onChange={() =>
                    updateDay({
                      ...dayData,
                      papers: dayData.papers.map((item) =>
                        item.id === paper.id ? { ...item, done: !item.done } : item
                      )
                    })
                  }
                />
                <span className={paper.done ? "line-through text-ink-500" : ""}>{paper.text}</span>
                <button
                  className="ml-auto text-xs text-ink-500"
                  onClick={() =>
                    updateDay({
                      ...dayData,
                      papers: dayData.papers.filter((item) => item.id !== paper.id)
                    })
                  }
                >
                  Remove
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
