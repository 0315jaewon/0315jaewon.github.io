"use client";

export const dynamic = "force-static";

import GoalEditor from "../../components/GoalEditor";
import OutcomeEditor from "../../components/OutcomeEditor";
import BucketManager from "../../components/BucketManager";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-sand-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-ink-900">Goals</h2>
        <p className="text-sm text-ink-600">Clarify direction and outcomes before planning the week.</p>
      </section>
      <GoalEditor />
      <OutcomeEditor />
      <BucketManager />
    </div>
  );
}
