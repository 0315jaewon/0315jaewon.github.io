"use client";

import { useMemo, useState } from "react";
import { useAppStore, makeNewLog } from "../lib/store";
import { matchQuery } from "../lib/utils";

export default function LogEditor() {
  const { state, dispatch } = useAppStore();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [linkedOutcomeId, setLinkedOutcomeId] = useState<string | "">("");
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const outcomes = state.outcomes;
  const tasks = state.tasks;

  const filtered = useMemo(() => {
    if (!search.trim()) return state.logs;
    return state.logs.filter((log) => {
      return matchQuery(log.title ?? "", search) || matchQuery(log.text, search);
    });
  }, [search, state.logs]);

  const toggleTask = (id: string) => {
    setLinkedTaskIds((prev) => (prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]));
  };

  const addLog = () => {
    if (!text.trim()) return;
    const log = makeNewLog({
      title: title.trim() || undefined,
      text: text.trim(),
      linkedOutcomeId: linkedOutcomeId || undefined,
      linkedTaskIds
    });
    dispatch({ type: "ADD_LOG", payload: log });
    setTitle("");
    setText("");
    setLinkedOutcomeId("");
    setLinkedTaskIds([]);
  };

  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Research Log</h2>
          <p className="text-sm text-ink-600">Capture results, insights, and changes.</p>
        </div>
        <button
          className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white"
          onClick={addLog}
        >
          Add Entry
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
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
              className="mt-2 min-h-[140px] w-full rounded-xl border border-sand-200 px-3 py-2"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>
          <label className="block text-sm text-ink-700">
            Link to Outcome
            <select
              className="mt-2 w-full rounded-xl border border-sand-200 px-3 py-2"
              value={linkedOutcomeId}
              onChange={(event) => setLinkedOutcomeId(event.target.value)}
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
            <p className="text-xs text-ink-600">Link tasks</p>
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
        </div>
        <div className="space-y-3">
          <input
            className="w-full rounded-full border border-sand-200 px-4 py-2 text-sm"
            placeholder="Search logs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="space-y-3">
            {filtered.length === 0 && <p className="text-sm text-ink-600">No log entries found.</p>}
            {filtered.map((log) => (
              <div key={log.id} className="rounded-xl border border-sand-200 bg-sand-50 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{log.title ?? "Untitled"}</p>
                    <p className="text-xs text-ink-600">{new Date(log.createdAtISO).toLocaleString()}</p>
                  </div>
                  <button
                    className="text-xs text-red-600"
                    onClick={() => dispatch({ type: "DELETE_LOG", payload: log.id })}
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 text-xs text-ink-700">{log.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
