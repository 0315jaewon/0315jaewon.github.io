"use client";

import { useMemo, useState } from "react";
import { bucketStyle } from "../lib/constants";
import { useAppStore, getWeekPlan, makeNewBlock } from "../lib/store";
import { minutesToLabel } from "../lib/utils";
import type { TimeBlock } from "../lib/types";
import Modal from "./Modal";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function BlockModal({
  initial,
  onClose,
  onSave
}: {
  initial?: TimeBlock;
  onClose: () => void;
  onSave: (block: TimeBlock) => void;
}) {
  const { state } = useAppStore();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [bucket, setBucket] = useState(initial?.bucket ?? state.buckets[0]?.id ?? "research");
  const [dayIndex, setDayIndex] = useState(initial?.dayIndex ?? 0);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "09:00");
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 60);
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>(initial?.linkedTaskIds ?? []);

  const toggleTask = (id: string) => {
    setLinkedTaskIds((prev) => (prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]));
  };

  const submit = () => {
    const base = initial ?? makeNewBlock({});
    onSave({
      ...base,
      title: title.trim() || "Time Block",
      bucket,
      dayIndex,
      startTime,
      durationMinutes,
      linkedTaskIds
    });
  };

  return (
    <Modal title={initial ? "Edit Time Block" : "New Time Block"} onClose={onClose}>
      <div className="space-y-4">
        <label className="block text-sm text-ink-700">
          Title
          <input
            className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-ink-700">
            Bucket
            <select
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
              value={bucket}
              onChange={(event) => setBucket(event.target.value as typeof bucket)}
            >
              {state.buckets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-ink-700">
            Day
            <select
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
              value={dayIndex}
              onChange={(event) => setDayIndex(Number(event.target.value))}
            >
              {days.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-ink-700">
            Start time
            <input
              type="time"
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </label>
          <label className="block text-sm text-ink-700">
            Duration (minutes)
            <input
              type="number"
              min={15}
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
            />
          </label>
        </div>
        <div>
          <p className="text-sm text-ink-700">Link tasks</p>
          <div className="mt-2 max-h-32 space-y-2 overflow-auto rounded-xl border border-sand-200 bg-sand-50 p-3">
            {state.tasks.length === 0 && <p className="text-xs text-ink-600">No tasks to link.</p>}
            {state.tasks.map((task) => (
              <label key={task.id} className="flex items-center gap-2 text-xs text-ink-700">
                <input type="checkbox" checked={linkedTaskIds.includes(task.id)} onChange={() => toggleTask(task.id)} />
                {task.title}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-sand-200 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white"
          >
            {initial ? "Save" : "Add Block"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function TimeBlockGrid({ weekStartISO }: { weekStartISO: string }) {
  const { state, dispatch } = useAppStore();
  const plan = getWeekPlan(state, weekStartISO);
  const [editing, setEditing] = useState<TimeBlock | null>(null);
  const [creatingDay, setCreatingDay] = useState<number | null>(null);
  const [view, setView] = useState<"day" | "week">("day");
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const updatePlan = (nextBlocks: TimeBlock[]) => {
    dispatch({ type: "UPSERT_WEEK", payload: { ...plan, timeBlocks: nextBlocks } });
  };

  const dayBlocks = (dayIndex: number) => plan.timeBlocks.filter((block) => block.dayIndex === dayIndex);

  const totalByBucket = useMemo(() => {
    return plan.timeBlocks.reduce((acc, block) => {
      acc[block.bucket] = (acc[block.bucket] ?? 0) + block.durationMinutes;
      return acc;
    }, {} as Record<string, number>);
  }, [plan.timeBlocks]);

  const completedByBucket = useMemo(() => {
    return plan.timeBlocks.reduce((acc, block) => {
      if (block.done) {
        acc[block.bucket] = (acc[block.bucket] ?? 0) + block.durationMinutes;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [plan.timeBlocks]);

  const reorderWithinDay = (dayIndex: number, draggedId: string, targetId: string) => {
    const dayList = dayBlocks(dayIndex);
    const fromIndex = dayList.findIndex((block) => block.id === draggedId);
    const toIndex = dayList.findIndex((block) => block.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const updatedDay = [...dayList];
    const [moved] = updatedDay.splice(fromIndex, 1);
    updatedDay.splice(toIndex, 0, moved);
    const otherBlocks = plan.timeBlocks.filter((block) => block.dayIndex !== dayIndex);
    updatePlan([...otherBlocks, ...updatedDay]);
  };

  const agendaItems = useMemo(() => {
    return [...plan.timeBlocks].sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [plan.timeBlocks]);

  const dayItems = useMemo(() => {
    return plan.timeBlocks
      .filter((block) => block.dayIndex === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [plan.timeBlocks, selectedDay]);

  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Time Blocks</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-sand-200 bg-sand-50 p-1 text-xs">
            <button
              className={`rounded-full px-3 py-1 ${view === "day" ? "bg-ink-900 text-white" : "text-ink-700"}`}
              onClick={() => setView("day")}
            >
              Day
            </button>
            <button
              className={`rounded-full px-3 py-1 ${view === "week" ? "bg-ink-900 text-white" : "text-ink-700"}`}
              onClick={() => setView("week")}
            >
              Week
            </button>
          </div>
          <button
            className="h-8 w-8 rounded-full border border-sand-200 text-sm text-ink-700"
            onClick={() => setCreatingDay(selectedDay)}
            aria-label="Add time block"
          >
            +
          </button>
        </div>
      </div>
      {view === "day" ? (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {days.map((day, index) => (
              <button
                key={day}
                className={`rounded-full px-3 py-1 text-xs ${
                  selectedDay === index ? "bg-ink-900 text-white" : "border border-sand-200 text-ink-700"
                }`}
                onClick={() => setSelectedDay(index)}
              >
                {day}
              </button>
            ))}
          </div>
        <div className="mt-4 space-y-3">
          {dayItems.length === 0 && (
            <p className="card-muted px-4 py-6 text-xs text-ink-600">
              No blocks for {days[selectedDay]}.
            </p>
          )}
          {dayItems.map((block) => {
            const meta = bucketStyle(state.buckets, block.bucket);
            return (
              <div key={block.id} className="card flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{block.title}</p>
                    <p className="text-xs text-ink-600">
                      {block.startTime} · {minutesToLabel(block.durationMinutes)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    <button
                      className={`rounded-full border border-sand-200 px-2 py-1 text-[10px] ${block.done ? "bg-ink-900 text-white" : ""}`}
                      onClick={() =>
                        updatePlan(plan.timeBlocks.map((item) => (item.id === block.id ? { ...item, done: !item.done } : item)))
                      }
                    >
                      {block.done ? "Done" : "Mark"}
                    </button>
                    <button className="text-[10px] text-ink-600" onClick={() => setEditing(block)}>
                      Edit
                    </button>
                    <button
                      className="text-[10px] text-red-600"
                      onClick={() => {
                        updatePlan(plan.timeBlocks.filter((item) => item.id !== block.id));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {agendaItems.length === 0 && (
            <p className="card-muted px-4 py-6 text-xs text-ink-600">
              No time blocks yet.
            </p>
          )}
          {agendaItems.map((block) => {
            const meta = bucketStyle(state.buckets, block.bucket);
            return (
              <div key={block.id} className="card flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{days[block.dayIndex]}</p>
                  <p className="text-sm font-semibold text-ink-900">{block.title}</p>
                  <p className="text-xs text-ink-600">
                    {block.startTime} · {minutesToLabel(block.durationMinutes)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${meta.bg} ${meta.color}`}>
                    {meta.label}
                  </span>
                  <button
                    className={`rounded-full border border-sand-200 px-2 py-1 text-[10px] ${block.done ? "bg-ink-900 text-white" : ""}`}
                    onClick={() =>
                      updatePlan(plan.timeBlocks.map((item) => (item.id === block.id ? { ...item, done: !item.done } : item)))
                    }
                  >
                    {block.done ? "Done" : "Mark"}
                  </button>
                  <button className="text-[10px] text-ink-600" onClick={() => setEditing(block)}>
                    Edit
                  </button>
                  <button
                    className="text-[10px] text-red-600"
                    onClick={() => {
                      updatePlan(plan.timeBlocks.filter((item) => item.id !== block.id));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="card-muted mt-4 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.28em] text-ink-600">Weekly Minutes</p>
          <p className="text-xs text-ink-500">Targets + progress</p>
        </div>
        <div className="mt-4 space-y-3">
          {state.buckets.map((bucket) => {
            const target = plan.bucketTargets[bucket.id] ?? 0;
            const complete = completedByBucket[bucket.id] ?? 0;
            const planned = totalByBucket[bucket.id] ?? 0;
            const pct = target === 0 ? 0 : Math.min(100, Math.round((complete / target) * 100));
            return (
              <div key={bucket.id} className="rounded-xl border border-sand-200 bg-white p-3">
                <div className="grid gap-3 md:grid-cols-[1.4fr_1fr] md:items-center">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{bucket.label}</p>
                    <p className="text-xs text-ink-600">
                      {minutesToLabel(complete)} / {minutesToLabel(target)}
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-sand-200">
                      <div className="h-2 rounded-full bg-ink-900" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 text-[11px] text-ink-600">
                    <span className="rounded-full bg-sand-100 px-2 py-1">Current {minutesToLabel(planned)}</span>
                    <label className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-2 py-1">
                      <span className="text-[10px] uppercase tracking-[0.2em]">Target</span>
                      <input
                        type="number"
                        min={0}
                        className="w-16 bg-transparent text-[11px] outline-none"
                        value={target}
                        onChange={(event) => {
                          const next = Number(event.target.value || 0);
                          dispatch({
                            type: "UPSERT_WEEK",
                            payload: {
                              ...plan,
                              bucketTargets: { ...plan.bucketTargets, [bucket.id]: next }
                            }
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {creatingDay !== null && (
        <BlockModal
          initial={{ ...makeNewBlock({}), dayIndex: creatingDay }}
          onClose={() => setCreatingDay(null)}
          onSave={(block) => {
            updatePlan([block, ...plan.timeBlocks]);
            setCreatingDay(null);
          }}
        />
      )}
      {editing && (
        <BlockModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(block) => {
            updatePlan(plan.timeBlocks.map((item) => (item.id === block.id ? block : item)));
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}
