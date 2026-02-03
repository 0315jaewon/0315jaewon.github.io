"use client";

import { useState } from "react";
import { useAppStore } from "../lib/store";
import { generateId } from "../lib/utils";
import { getNextBucketColors } from "../lib/constants";

export default function BucketManager() {
  const { state, dispatch } = useAppStore();
  const [label, setLabel] = useState("");

  const addBucket = () => {
    if (!label.trim()) return;
    const colors = getNextBucketColors(state.buckets.length);
    const id = label.trim().toLowerCase().replace(/\s+/g, "-");
    dispatch({
      type: "ADD_BUCKET",
      payload: {
        id: `${id}-${generateId().slice(-4)}`,
        label: label.trim(),
        ...colors
      }
    });
    setLabel("");
  };

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">Buckets</h3>
        <span className="chip">Tags</span>
      </div>
      <div className="mt-3 space-y-2">
        {state.buckets.map((bucket) => (
          <div key={bucket.id} className="flex items-center justify-between rounded-xl border border-sand-200 bg-sand-50 px-3 py-2 text-xs">
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${bucket.bg} ${bucket.color}`}>{bucket.label}</span>
            <button
              className="text-xs text-ink-500"
              onClick={() => dispatch({ type: "DELETE_BUCKET", payload: bucket.id })}
              disabled={state.buckets.length <= 1}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="w-full rounded-xl border border-sand-200 px-3 py-2 text-xs"
          placeholder="New bucket"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <button className="rounded-full border border-sand-200 px-3 py-1 text-xs" onClick={addBucket}>
          Add
        </button>
      </div>
    </section>
  );
}
