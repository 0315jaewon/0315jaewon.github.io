"use client";

export const dynamic = "force-static";

import { useMemo, useState } from "react";
import { useAppStore, getWeekPlan } from "../../lib/store";
import { generateId, getWeekStartMonday, toISODate } from "../../lib/utils";
import TimeBlockGrid from "../../components/TimeBlockGrid";
import DailyFocus from "../../components/DailyFocus";

export default function WeekPage() {
  const { state, dispatch } = useAppStore();
  const [weekStart, setWeekStart] = useState(() => toISODate(getWeekStartMonday(new Date())));
  const [showCommitmentInput, setShowCommitmentInput] = useState(false);
  const [commitmentText, setCommitmentText] = useState("");
  const [editingCommitmentId, setEditingCommitmentId] = useState<string | null>(null);
  const plan = getWeekPlan(state, weekStart);

  const northStar = useMemo(
    () => state.outcomes.find((outcome) => outcome.id === state.northStarOutcomeId),
    [state.northStarOutcomeId, state.outcomes]
  );

  const updatePlan = (partial: Partial<typeof plan>) => {
    dispatch({ type: "UPSERT_WEEK", payload: { ...plan, ...partial } });
  };

  const shiftWeek = (delta: number) => {
    const start = new Date(weekStart);
    start.setDate(start.getDate() + delta * 7);
    setWeekStart(toISODate(start));
  };

  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-ink-600">This Week</p>
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

      {northStar && (
        <section className="rounded-2xl border border-sand-200 bg-sand-50 p-4 text-sm text-ink-700">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-600">North Star Outcome</p>
          <p className="mt-1 font-semibold text-ink-900">{northStar.title}</p>
          <p className="text-xs text-ink-600">{northStar.description}</p>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Weekly Commitments</h3>
              </div>
              <span className="chip">Plan</span>
            </div>
            <div className="mt-3 space-y-2">
              {plan.weeklyCommitments.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-3 py-2">
                  <input
                    type="checkbox"
                    className="check"
                    checked={item.done}
                    onChange={() => {
                      const next = plan.weeklyCommitments.map((commitment) =>
                        commitment.id === item.id ? { ...commitment, done: !commitment.done } : commitment
                      );
                      updatePlan({ weeklyCommitments: next });
                    }}
                  />
                  {editingCommitmentId === item.id ? (
                    <input
                      className="flex-1 rounded-md border border-sand-200 px-2 py-1 text-xs text-ink-900 outline-none"
                      placeholder={`Commitment ${index + 1}`}
                      value={item.text}
                      onChange={(event) => {
                        const next = plan.weeklyCommitments.map((commitment) =>
                          commitment.id === item.id ? { ...commitment, text: event.target.value } : commitment
                        );
                        updatePlan({ weeklyCommitments: next });
                      }}
                      onBlur={() => setEditingCommitmentId(null)}
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      className={`flex-1 text-left text-xs ${item.done ? "line-through text-ink-500" : "text-ink-900"}`}
                      onClick={() => setEditingCommitmentId(item.id)}
                    >
                      {item.text || "Untitled commitment"}
                    </button>
                  )}
                  <button
                    className="text-xs text-ink-500"
                    onClick={() =>
                      updatePlan({
                        weeklyCommitments: plan.weeklyCommitments.filter((commitment) => commitment.id !== item.id)
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              {plan.weeklyCommitments.length === 0 && (
                <p className="text-xs text-ink-600">No commitments yet.</p>
              )}
              {showCommitmentInput && (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-sand-200 px-3 py-2">
                  <input
                    className="flex-1 bg-transparent text-xs text-ink-900 outline-none"
                    placeholder="New commitment"
                    value={commitmentText}
                    onChange={(event) => setCommitmentText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (!commitmentText.trim()) return;
                        updatePlan({
                          weeklyCommitments: [
                            ...plan.weeklyCommitments,
                            { id: generateId(), text: commitmentText.trim(), done: false, locked: false }
                          ]
                        });
                        setCommitmentText("");
                        setShowCommitmentInput(false);
                      }
                    }}
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                {plan.weeklyCommitments.length < 7 && (
                  <button
                    className="rounded-full border border-sand-200 px-2 py-0.5 text-xs text-ink-700"
                    onClick={() => setShowCommitmentInput((prev) => !prev)}
                  >
                    +
                  </button>
                )}
                {plan.weeklyCommitments.length > 0 && (
                  <button
                    className="text-xs text-ink-500"
                    onClick={() => updatePlan({ weeklyCommitments: [] })}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          <DailyFocus weekStartISO={weekStart} />

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Weekly Review</h3>
              <span className="chip">Reflect</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-ink-600">Editable</p>
              <button
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${plan.weeklyReview.locked ? "border-ink-900 bg-ink-900 text-white" : "border-sand-200 text-ink-700"}`}
                onClick={() =>
                  updatePlan({
                    weeklyReview: { ...plan.weeklyReview, locked: !plan.weeklyReview.locked }
                  })
                }
              >
                {plan.weeklyReview.locked ? "Locked" : "Unlocked"}
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-ink-700">Score</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  className="w-16 rounded-full border border-sand-200 px-3 py-2 text-xs"
                  disabled={plan.weeklyReview.locked}
                  value={plan.weeklyReview.score0to10 ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    updatePlan({
                      weeklyReview: { ...plan.weeklyReview, score0to10: value === "" ? undefined : Number(value) }
                    });
                  }}
                />
                <span className="text-xs text-ink-600">/ 10</span>
              </div>
              <label className="block text-xs font-semibold text-ink-700">
                What went well
                <textarea
                  className="mt-2 min-h-[80px] w-full rounded-xl border border-sand-200 px-3 py-2 text-xs"
                  disabled={plan.weeklyReview.locked}
                  value={plan.weeklyReview.wentWell ?? ""}
                  onChange={(event) =>
                    updatePlan({ weeklyReview: { ...plan.weeklyReview, wentWell: event.target.value } })
                  }
                />
              </label>
              <label className="block text-xs font-semibold text-ink-700">
                What to improve
                <textarea
                  className="mt-2 min-h-[80px] w-full rounded-xl border border-sand-200 px-3 py-2 text-xs"
                  disabled={plan.weeklyReview.locked}
                  value={plan.weeklyReview.improve ?? ""}
                  onChange={(event) =>
                    updatePlan({ weeklyReview: { ...plan.weeklyReview, improve: event.target.value } })
                  }
                />
              </label>
              <label className="block text-xs font-semibold text-ink-700">
                Next week focus
                <textarea
                  className="mt-2 min-h-[80px] w-full rounded-xl border border-sand-200 px-3 py-2 text-xs"
                  disabled={plan.weeklyReview.locked}
                  value={plan.weeklyReview.nextWeekFocus ?? ""}
                  onChange={(event) =>
                    updatePlan({
                      weeklyReview: { ...plan.weeklyReview, nextWeekFocus: event.target.value }
                    })
                  }
                />
              </label>
            </div>
          </div>
        </section>

        <div className="lg:col-span-8">
          <TimeBlockGrid weekStartISO={weekStart} />
        </div>
      </div>
    </div>
  );
}
