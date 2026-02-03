"use client";

import { useMemo, useState } from "react";
import { useAppStore, makeNewTask } from "../lib/store";
import Modal from "./Modal";

export default function TaskModal() {
  const { state, dispatch } = useAppStore();
  const [title, setTitle] = useState("");
  const [bucket, setBucket] = useState(state.buckets[0]?.id ?? "research");
  const [outcomeId, setOutcomeId] = useState<string | undefined>(undefined);
  const [estimate, setEstimate] = useState<number | "">("");

  const outcomes = useMemo(() => state.outcomes, [state.outcomes]);

  const onClose = () => dispatch({ type: "CLOSE_MODALS" });

  const onSave = () => {
    if (!title.trim()) return;
    const task = makeNewTask({
      title: title.trim(),
      bucket,
      outcomeId,
      estimateMinutes: estimate === "" ? undefined : Number(estimate)
    });
    dispatch({ type: "ADD_TASK", payload: task });
    onClose();
  };

  return (
    <Modal title="New Task" onClose={onClose}>
      <div className="space-y-4">
        <label className="block text-sm text-ink-700">
          Title
          <input
            className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Draft experiment summary"
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
            Estimate (minutes)
            <input
              type="number"
              min={0}
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
              value={estimate}
              onChange={(event) => setEstimate(event.target.value === "" ? "" : Number(event.target.value))}
            />
          </label>
        </div>
        <label className="block text-sm text-ink-700">
          Outcome (optional)
          <select
            className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
            value={outcomeId ?? ""}
            onChange={(event) => setOutcomeId(event.target.value || undefined)}
          >
            <option value="">None</option>
            {outcomes.map((outcome) => (
              <option key={outcome.id} value={outcome.id}>
                {outcome.title}
              </option>
            ))}
          </select>
        </label>
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
            onClick={onSave}
            className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white"
          >
            Add Task
          </button>
        </div>
      </div>
    </Modal>
  );
}
