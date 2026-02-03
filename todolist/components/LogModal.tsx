"use client";

import { useMemo, useState } from "react";
import { useAppStore, makeNewLog } from "../lib/store";
import Modal from "./Modal";

export default function LogModal() {
  const { state, dispatch } = useAppStore();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [linkedOutcomeId, setLinkedOutcomeId] = useState<string | undefined>(undefined);
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>([]);

  const outcomes = useMemo(() => state.outcomes, [state.outcomes]);
  const tasks = useMemo(() => state.tasks, [state.tasks]);
  const onClose = () => dispatch({ type: "CLOSE_MODALS" });

  const onSave = () => {
    if (!text.trim()) return;
    const log = makeNewLog({
      title: title.trim() || undefined,
      text: text.trim(),
      linkedOutcomeId,
      linkedTaskIds
    });
    dispatch({ type: "ADD_LOG", payload: log });
    onClose();
  };

  const toggleTask = (id: string) => {
    setLinkedTaskIds((prev) => (prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]));
  };

  return (
    <Modal title="New Log Entry" onClose={onClose}>
      <div className="space-y-4">
        <label className="block text-sm text-ink-700">
          Title (optional)
          <input
            className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="block text-sm text-ink-700">
          Entry
          <textarea
            className="mt-2 min-h-[120px] w-full rounded-xl border border-sand-200 px-3 py-2"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="What did you learn or ship today?"
          />
        </label>
        <label className="block text-sm text-ink-700">
          Link to Outcome (optional)
          <select
            className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
            value={linkedOutcomeId ?? ""}
            onChange={(event) => setLinkedOutcomeId(event.target.value || undefined)}
          >
            <option value="">None</option>
            {outcomes.map((outcome) => (
              <option key={outcome.id} value={outcome.id}>
                {outcome.title}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-xl border border-sand-200 bg-sand-50 p-3">
          <p className="text-xs text-ink-600">Link tasks (optional)</p>
          <div className="mt-2 max-h-28 space-y-2 overflow-auto">
            {tasks.length === 0 && <p className="text-xs text-ink-500">No tasks available.</p>}
            {tasks.map((task) => (
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
            onClick={onSave}
            className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white"
          >
            Add Log
          </button>
        </div>
      </div>
    </Modal>
  );
}
