"use client";

import { useState } from "react";
import { useAppStore } from "../lib/store";
import { STORAGE_VERSION } from "../lib/utils";
import type { AppState } from "../lib/types";
import Modal from "./Modal";

function validateState(raw: unknown): raw is AppState {
  if (!raw || typeof raw !== "object") return false;
  const state = raw as AppState;
  return Array.isArray(state.goals) && Array.isArray(state.outcomes) && Array.isArray(state.tasks) && Array.isArray(state.logs);
}

export default function ImportExportModal() {
  const { state, dispatch } = useAppStore();
  const [value, setValue] = useState(JSON.stringify(state, null, 2));
  const [error, setError] = useState<string | null>(null);

  const onClose = () => dispatch({ type: "CLOSE_MODALS" });

  const onExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "research-ops-planner.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const onImport = () => {
    try {
      const parsed = JSON.parse(value);
      if (!validateState(parsed)) {
        setError("Invalid data format. Please check the JSON.");
        return;
      }
      if (parsed.storageVersion !== STORAGE_VERSION) {
        parsed.storageVersion = STORAGE_VERSION;
      }
      dispatch({ type: "LOAD_STATE", payload: parsed });
      setError(null);
      onClose();
    } catch {
      setError("Could not parse JSON.");
    }
  };

  return (
    <Modal title="Export / Import Data" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-ink-600">Export your data or replace it by pasting JSON below.</p>
        <textarea
          className="min-h-[180px] w-full rounded-2xl border border-sand-200 px-3 py-2 text-xs"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onExport}
            className="rounded-full border border-sand-200 px-4 py-2 text-sm"
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={onImport}
            className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white"
          >
            Replace Data
          </button>
        </div>
      </div>
    </Modal>
  );
}
