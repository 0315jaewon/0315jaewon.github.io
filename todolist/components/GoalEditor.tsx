"use client";

import { useMemo, useState } from "react";
import { useAppStore, makeNewGoal } from "../lib/store";
import GoalModal from "./GoalModal";

export default function GoalEditor() {
  const { state, dispatch } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingGoal = useMemo(() => state.goals.find((goal) => goal.id === editingId), [editingId, state.goals]);

  const close = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const onSave = (payload: { title: string; description: string }) => {
    if (editingGoal) {
      dispatch({
        type: "UPDATE_GOAL",
        payload: { ...editingGoal, title: payload.title, description: payload.description }
      });
    } else {
      dispatch({ type: "ADD_GOAL", payload: makeNewGoal(payload) });
    }
    close();
  };

  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Direction Goals</h2>
          <p className="text-sm text-ink-600">Long-term direction for the next 12 months.</p>
        </div>
        <button
          className="rounded-full bg-ink-900 px-4 py-2 text-sm text-white"
          onClick={() => setModalOpen(true)}
        >
          Add Goal
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {state.goals.length === 0 && <p className="text-sm text-ink-600">No direction goals yet.</p>}
        {state.goals.map((goal) => (
          <div key={goal.id} className="rounded-xl border border-sand-200 bg-sand-50 px-4 py-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{goal.title}</h3>
                <p className="mt-1 text-xs text-ink-600">{goal.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-full border border-sand-200 px-3 py-1 text-xs"
                  onClick={() => {
                    setEditingId(goal.id);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded-full border border-sand-200 px-3 py-1 text-xs text-red-600"
                  onClick={() => dispatch({ type: "DELETE_GOAL", payload: goal.id })}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && <GoalModal initial={editingGoal} onClose={close} onSave={onSave} />}
    </section>
  );
}
