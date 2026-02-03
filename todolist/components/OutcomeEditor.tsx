"use client";

import { useMemo, useState } from "react";
import { useAppStore, makeNewOutcome } from "../lib/store";
import OutcomeModal from "./OutcomeModal";

export default function OutcomeEditor() {
  const { state, dispatch } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingOutcome = useMemo(
    () => state.outcomes.find((outcome) => outcome.id === editingId),
    [editingId, state.outcomes]
  );

  const close = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const onSave = (payload: {
    title: string;
    description: string;
    dueDate?: string;
    status: "planned" | "active" | "done";
    linkedGoalIds: string[];
  }) => {
    if (editingOutcome) {
      dispatch({
        type: "UPDATE_OUTCOME",
        payload: { ...editingOutcome, ...payload }
      });
    } else {
      dispatch({ type: "ADD_OUTCOME", payload: makeNewOutcome(payload) });
    }
    close();
  };

  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Outcomes (3–6 months)</h2>
          <p className="text-sm text-ink-600">Track milestones and status across your focus areas.</p>
        </div>
        <button
          className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white"
          onClick={() => setModalOpen(true)}
        >
          Add Outcome
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {state.outcomes.length === 0 && <p className="text-sm text-ink-600">No outcomes yet.</p>}
        {state.outcomes.map((outcome) => (
          <div key={outcome.id} className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink-900">{outcome.title}</h3>
                  {state.northStarOutcomeId === outcome.id && (
                    <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white">
                      North Star
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-600">{outcome.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-600">
                  <span>Status: {outcome.status}</span>
                  {outcome.dueDate && <span>Due: {outcome.dueDate}</span>}
                  {outcome.linkedGoalIds.length > 0 && (
                    <span>Linked goals: {outcome.linkedGoalIds.length}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {outcome.status === "active" && (
                  <button
                    className="rounded-full border border-sand-200 px-3 py-1 text-xs"
                    onClick={() => dispatch({ type: "SET_NORTH_STAR", payload: outcome.id })}
                  >
                    Set North Star
                  </button>
                )}
                <button
                  className="rounded-full border border-sand-200 px-3 py-1 text-xs"
                  onClick={() => {
                    setEditingId(outcome.id);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded-full border border-sand-200 px-3 py-1 text-xs text-red-600"
                  onClick={() => dispatch({ type: "DELETE_OUTCOME", payload: outcome.id })}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && (
        <OutcomeModal initial={editingOutcome} goals={state.goals} onClose={close} onSave={onSave} />
      )}
    </section>
  );
}
