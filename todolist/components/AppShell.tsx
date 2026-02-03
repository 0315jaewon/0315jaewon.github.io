"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "../lib/store";
import TaskModal from "./TaskModal";
import LogModal from "./LogModal";
import ImportExportModal from "./ImportExportModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useAppStore();
  const pathname = usePathname();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput = target && ["INPUT", "TEXTAREA"].includes(target.tagName);
      if (isInput) return;
      if (event.key === "n") {
        dispatch({ type: "OPEN_TASK_MODAL" });
      }
      if (event.key === "l") {
        dispatch({ type: "OPEN_LOG_MODAL" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[auto,1fr,auto] md:items-center">
          <div className="flex items-center justify-between gap-4 md:block">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-ink-600">Research Planner</p>
              <h1 className="text-lg font-semibold text-ink-900">Weekly Plan</h1>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "OPEN_TASK_MODAL" })}
              className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white md:hidden"
            >
              + Task
            </button>
          </div>
          <nav className="flex flex-wrap justify-start gap-2 text-sm md:justify-center">
            <Link
              className={`rounded-full px-3 py-1.5 ${
                pathname === "/goals" ? "bg-ink-900 text-white" : "border border-sand-200 text-ink-700"
              }`}
              href="/goals"
            >
              Goals
            </Link>
            <Link
              className={`rounded-full px-3 py-1.5 ${
                pathname === "/week" || pathname === "/" ? "bg-ink-900 text-white" : "border border-sand-200 text-ink-700"
              }`}
              href="/week"
            >
              This Week
            </Link>
            <Link
              className={`rounded-full px-3 py-1.5 ${
                pathname === "/log" ? "bg-ink-900 text-white" : "border border-sand-200 text-ink-700"
              }`}
              href="/log"
            >
              Log
            </Link>
          </nav>
          <div className="hidden items-center justify-end gap-2 md:flex">
            <button
              type="button"
              onClick={() => dispatch({ type: "OPEN_TASK_MODAL" })}
              className="rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white"
            >
              + Task
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      {state.ui.taskModalOpen && <TaskModal />}
      {state.ui.logModalOpen && <LogModal />}
      {state.ui.dataModalOpen && <ImportExportModal />}
    </div>
  );
}
