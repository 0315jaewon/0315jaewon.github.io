"use client";

import { useState } from "react";
import Modal from "./Modal";
import type { DirectionGoal } from "../lib/types";

export default function GoalModal({
  initial,
  onClose,
  onSave
}: {
  initial?: DirectionGoal;
  onClose: () => void;
  onSave: (goal: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const submit = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() });
  };

  return (
    <Modal title={initial ? "Edit Direction Goal" : "New Direction Goal"} onClose={onClose}>
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
            {initial ? "Save" : "Add Goal"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
