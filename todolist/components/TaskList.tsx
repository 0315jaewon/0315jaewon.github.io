"use client";

import { useMemo, useState } from "react";
import { bucketStyle } from "../lib/constants";
import { useAppStore, makeNewTask } from "../lib/store";
import { minutesToLabel } from "../lib/utils";
import type { TaskStatus } from "../lib/types";

const statusOrder: TaskStatus[] = ["todo", "doing", "done"];

export default function TaskList() {
  const { state, dispatch } = useAppStore();
  const [title, setTitle] = useState("");
  const [bucket, setBucket] = useState(state.buckets[0]?.id ?? "research");
  const [outcomeId, setOutcomeId] = useState<string | "">("");
  const [estimate, setEstimate] = useState<number | "">("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [filterBucket, setFilterBucket] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterOutcome, setFilterOutcome] = useState<string>("all");

  const outcomes = state.outcomes;

  const filtered = useMemo(() => {
    return state.tasks.filter((task) => {
      if (filterBucket !== "all" && task.bucket !== filterBucket) return false;
      if (filterStatus !== "all" && task.status !== filterStatus) return false;
      if (filterOutcome !== "all" && task.outcomeId !== filterOutcome) return false;
      return true;
    });
  }, [state.tasks, filterBucket, filterStatus, filterOutcome]);

  const addTask = () => {
    if (!title.trim()) return;
    const task = makeNewTask({
      title: title.trim(),
      bucket,
      outcomeId: outcomeId || undefined,
      estimateMinutes: estimate === "" ? undefined : Number(estimate)
    });
    dispatch({ type: "ADD_TASK", payload: task });
    setTitle("");
    setEstimate("");
  };

  const cycleStatus = (status: TaskStatus) => {
    const index = statusOrder.indexOf(status);
    return statusOrder[(index + 1) % statusOrder.length];
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Task Inbox</h3>
        </div>
        <span className="rounded-full bg-sand-100 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-ink-600">
          Execute
        </span>
      </div>
      <div className="mt-3 space-y-3">
        <div className="grid gap-2">
          <input
            className="rounded-xl border border-sand-200 px-3 py-2 text-sm"
            placeholder="New task (e.g., summarize paper)"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <div className="grid gap-2 md:grid-cols-2">
            <select
              className="rounded-xl border border-sand-200 px-3 py-2 text-sm"
              value={bucket}
              onChange={(event) => setBucket(event.target.value as typeof bucket)}
            >
              {state.buckets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              className="rounded-xl border border-sand-200 px-3 py-2 text-sm"
              placeholder="Estimate (min)"
              value={estimate}
              onChange={(event) => setEstimate(event.target.value === "" ? "" : Number(event.target.value))}
            />
          </div>
          <select
            className="rounded-xl border border-sand-200 px-3 py-2 text-sm"
            value={outcomeId}
            onChange={(event) => setOutcomeId(event.target.value)}
          >
            <option value="">Link outcome (optional)</option>
            {outcomes.map((outcome) => (
              <option key={outcome.id} value={outcome.id}>
                {outcome.title}
              </option>
            ))}
          </select>
          <button type="button" onClick={addTask} className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white">
            Add Task
          </button>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <select
            className="rounded-xl border border-sand-200 px-2 py-1 text-xs"
            value={filterBucket}
            onChange={(event) => setFilterBucket(event.target.value)}
          >
            <option value="all">All buckets</option>
            {state.buckets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-sand-200 px-2 py-1 text-xs"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="all">All status</option>
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
          <select
            className="rounded-xl border border-sand-200 px-2 py-1 text-xs"
            value={filterOutcome}
            onChange={(event) => setFilterOutcome(event.target.value)}
          >
            <option value="all">All outcomes</option>
            {outcomes.map((outcome) => (
              <option key={outcome.id} value={outcome.id}>
                {outcome.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-xs text-ink-600">No tasks match the filters.</p>}
          {filtered.map((task) => {
            const bucketMeta = bucketStyle(state.buckets, task.bucket);
            return (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl border border-sand-200 bg-sand-50 px-3 py-2"
              >
                <div className="w-full">
                  <p className="text-sm text-ink-900">{task.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-600">
                    <span className={`rounded-full px-3 py-1 text-xs ${bucketMeta.bg} ${bucketMeta.color}`}>
                      {bucketMeta.label}
                    </span>
                    {task.estimateMinutes && <span>{minutesToLabel(task.estimateMinutes)}</span>}
                    {task.outcomeId && (
                      <span>Outcome: {outcomes.find((o) => o.id === task.outcomeId)?.title}</span>
                    )}
                  </div>
                  {expanded.has(task.id) && (
                    <div className="mt-3 grid gap-2">
                      <textarea
                        className="min-h-[90px] w-full rounded-xl border border-sand-200 px-3 py-2 text-xs"
                        placeholder="Notes"
                        value={task.notes ?? ""}
                        onChange={(event) =>
                          dispatch({
                            type: "UPDATE_TASK",
                            payload: { ...task, notes: event.target.value, updatedAt: new Date().toISOString() }
                          })
                        }
                      />
                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="text-xs text-ink-600">
                          Due date
                          <input
                            type="date"
                            className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2 text-xs"
                            value={task.dueDate ?? ""}
                            onChange={(event) =>
                              dispatch({
                                type: "UPDATE_TASK",
                                payload: { ...task, dueDate: event.target.value, updatedAt: new Date().toISOString() }
                              })
                            }
                          />
                        </label>
                        <label className="text-xs text-ink-600">
                          Estimate (min)
                          <input
                            type="number"
                            min={0}
                            className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2 text-xs"
                            value={task.estimateMinutes ?? ""}
                            onChange={(event) =>
                              dispatch({
                                type: "UPDATE_TASK",
                                payload: {
                                  ...task,
                                  estimateMinutes: Number(event.target.value || 0),
                                  updatedAt: new Date().toISOString()
                                }
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-full border border-sand-200 px-2 py-1 text-xs"
                    onClick={() => toggleExpanded(task.id)}
                  >
                    {expanded.has(task.id) ? "Hide" : "Details"}
                  </button>
                  <button
                    className={`rounded-full border border-sand-200 px-2 py-1 text-xs ${
                      task.status === "done" ? "bg-ink-900 text-white" : ""
                    }`}
                    onClick={() =>
                      dispatch({
                        type: "UPDATE_TASK",
                        payload: { ...task, status: cycleStatus(task.status), updatedAt: new Date().toISOString() }
                      })
                    }
                  >
                    {task.status}
                  </button>
                  <button
                    className="rounded-full border border-sand-200 px-2 py-1 text-xs text-red-600"
                    onClick={() => dispatch({ type: "DELETE_TASK", payload: task.id })}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
