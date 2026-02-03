"use client";

import { useState } from "react";
import type { DirectionGoal, Outcome, OutcomeStatus } from "../lib/types";
import Modal from "./Modal";

export default function OutcomeModal({
  initial,
  goals,
  onClose,
  onSave
}: {
  initial?: Outcome;
  goals: DirectionGoal[];
  onClose: () => void;
  onSave: (payload: {
    title: string;
    description: string;
    dueDate?: string;
    status: OutcomeStatus;
    linkedGoalIds: string[];
  }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [status, setStatus] = useState<OutcomeStatus>(initial?.status ?? "planned");
  const [linked, setLinked] = useState<string[]>(initial?.linkedGoalIds ?? []);

  const toggleGoal = (id: string) => {
    setLinked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const submit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
      status,
      linkedGoalIds: linked
    });
  };

  return (
    <Modal title={initial ? "Edit Outcome" : "New Outcome"} onClose={onClose}>
      <div className="space-y-4">
        <label className="block text-sm text-ink-700">
          Title
          <input
            className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="block text-sm text-ink-700">
          Description
          <textarea
            className="mt-2 min-h-[120px] w-full rounded-xl border border-sand-200 px-3 py-2"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-ink-700">
            Status
            <select
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
              value={status}
              onChange={(event) => setStatus(event.target.value as OutcomeStatus)}
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label className="block text-sm text-ink-700">
            Due Date
            <input
              type="date"
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>
        <div>
          <p className="text-sm text-ink-700">Link to Direction Goals</p>
          <div className="mt-2 grid gap-2">
            {goals.length === 0 && <p className="text-xs text-ink-600">Add a direction goal first.</p>}
            {goals.map((goal) => (
              <label key={goal.id} className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={linked.includes(goal.id)}
                  onChange={() => toggleGoal(goal.id)}
                />
                {goal.title}
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
            {initial ? "Save" : "Add Outcome"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
