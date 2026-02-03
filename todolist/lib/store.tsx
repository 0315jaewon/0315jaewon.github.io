"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type {
  AppState,
  DirectionGoal,
  DailyFocus,
  LogEntry,
  Outcome,
  Task,
  TimeBlock,
  WeeklyPlan,
  Bucket,
  BucketDefinition
} from "./types";
import { STORAGE_KEY, STORAGE_VERSION, safeReadLocalStorage, safeWriteLocalStorage, generateId } from "./utils";
import { DEFAULT_BUCKETS, getNextBucketColors } from "./constants";

const defaultBucketTargets = (buckets: BucketDefinition[]) =>
  buckets.reduce((acc, bucket) => {
    acc[bucket.id] = bucket.id === "research" ? 360 : 120;
    return acc;
  }, {} as Record<Bucket, number>);

const defaultDailyGoals: Record<number, DailyFocus> = Array.from({ length: 7 }).reduce((acc, _, index) => {
  acc[index] = { items: [], progress: "", papers: [] };
  return acc;
}, {} as Record<number, DailyFocus>);

const initialState: AppState = {
  storageVersion: STORAGE_VERSION,
  buckets: DEFAULT_BUCKETS,
  goals: [],
  outcomes: [],
  tasks: [],
  weeklyPlans: {},
  logs: [],
  northStarOutcomeId: undefined,
  ui: {
    taskModalOpen: false,
    logModalOpen: false,
    dataModalOpen: false
  }
};

type Action =
  | { type: "LOAD_STATE"; payload: AppState }
  | { type: "ADD_GOAL"; payload: DirectionGoal }
  | { type: "UPDATE_GOAL"; payload: DirectionGoal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_BUCKET"; payload: BucketDefinition }
  | { type: "UPDATE_BUCKET"; payload: BucketDefinition }
  | { type: "DELETE_BUCKET"; payload: string }
  | { type: "ADD_OUTCOME"; payload: Outcome }
  | { type: "UPDATE_OUTCOME"; payload: Outcome }
  | { type: "DELETE_OUTCOME"; payload: string }
  | { type: "SET_NORTH_STAR"; payload?: string }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "ADD_LOG"; payload: LogEntry }
  | { type: "UPDATE_LOG"; payload: LogEntry }
  | { type: "DELETE_LOG"; payload: string }
  | { type: "UPSERT_WEEK"; payload: WeeklyPlan }
  | { type: "OPEN_TASK_MODAL" }
  | { type: "OPEN_LOG_MODAL" }
  | { type: "OPEN_DATA_MODAL" }
  | { type: "CLOSE_MODALS" };

function migrateState(raw: AppState | null): AppState {
  if (!raw) return initialState;
  const migrated: AppState = {
    ...initialState,
    ...raw,
    storageVersion: STORAGE_VERSION,
    ui: initialState.ui
  };
  return migrated;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...state, ...action.payload, ui: state.ui };
    case "ADD_BUCKET":
      return { ...state, buckets: [...state.buckets, action.payload] };
    case "UPDATE_BUCKET":
      return {
        ...state,
        buckets: state.buckets.map((bucket) => (bucket.id === action.payload.id ? action.payload : bucket))
      };
    case "DELETE_BUCKET": {
      if (state.buckets.length <= 1) return state;
      const remaining = state.buckets.filter((bucket) => bucket.id !== action.payload);
      const fallback = remaining[0].id;
      return {
        ...state,
        buckets: remaining,
        tasks: state.tasks.map((task) =>
          task.bucket === action.payload ? { ...task, bucket: fallback } : task
        ),
        weeklyPlans: reassignBucketInPlans(state.weeklyPlans, action.payload, fallback)
      };
    }
    case "ADD_GOAL":
      return { ...state, goals: [action.payload, ...state.goals] };
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((goal) => (goal.id === action.payload.id ? action.payload : goal))
      };
    case "DELETE_GOAL":
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.payload),
        outcomes: state.outcomes.map((outcome) => ({
          ...outcome,
          linkedGoalIds: outcome.linkedGoalIds.filter((id) => id !== action.payload)
        }))
      };
    case "ADD_OUTCOME":
      return { ...state, outcomes: [action.payload, ...state.outcomes] };
    case "UPDATE_OUTCOME":
      return {
        ...state,
        outcomes: state.outcomes.map((outcome) => (outcome.id === action.payload.id ? action.payload : outcome))
      };
    case "DELETE_OUTCOME":
      return {
        ...state,
        outcomes: state.outcomes.filter((outcome) => outcome.id !== action.payload),
        tasks: state.tasks.map((task) => (task.outcomeId === action.payload ? { ...task, outcomeId: undefined } : task)),
        northStarOutcomeId: state.northStarOutcomeId === action.payload ? undefined : state.northStarOutcomeId
      };
    case "SET_NORTH_STAR":
      return { ...state, northStarOutcomeId: action.payload };
    case "ADD_TASK":
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task))
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        weeklyPlans: removeTaskFromPlans(state.weeklyPlans, action.payload)
      };
    case "ADD_LOG":
      return { ...state, logs: [action.payload, ...state.logs] };
    case "UPDATE_LOG":
      return {
        ...state,
        logs: state.logs.map((log) => (log.id === action.payload.id ? action.payload : log))
      };
    case "DELETE_LOG":
      return { ...state, logs: state.logs.filter((log) => log.id !== action.payload) };
    case "UPSERT_WEEK":
      return {
        ...state,
        weeklyPlans: {
          ...state.weeklyPlans,
          [action.payload.weekStartISO]: action.payload
        }
      };
    case "OPEN_TASK_MODAL":
      return { ...state, ui: { ...state.ui, taskModalOpen: true } };
    case "OPEN_LOG_MODAL":
      return { ...state, ui: { ...state.ui, logModalOpen: true } };
    case "OPEN_DATA_MODAL":
      return { ...state, ui: { ...state.ui, dataModalOpen: true } };
    case "CLOSE_MODALS":
      return { ...state, ui: { ...state.ui, taskModalOpen: false, logModalOpen: false, dataModalOpen: false } };
    default:
      return state;
  }
}

function removeTaskFromPlans(plans: Record<string, WeeklyPlan>, taskId: string) {
  const updated: Record<string, WeeklyPlan> = {};
  Object.entries(plans).forEach(([key, plan]) => {
    updated[key] = {
      ...plan,
      timeBlocks: plan.timeBlocks.map((block) => ({
        ...block,
        linkedTaskIds: block.linkedTaskIds.filter((id) => id !== taskId)
      }))
    };
  });
  return updated;
}

function reassignBucketInPlans(plans: Record<string, WeeklyPlan>, removed: string, fallback: string) {
  const updated: Record<string, WeeklyPlan> = {};
  Object.entries(plans).forEach(([key, plan]) => {
    updated[key] = {
      ...plan,
      timeBlocks: plan.timeBlocks.map((block) =>
        block.bucket === removed ? { ...block, bucket: fallback } : block
      ),
      bucketTargets: Object.fromEntries(
        Object.entries(plan.bucketTargets).map(([bucketId, value]) => [
          bucketId === removed ? fallback : bucketId,
          value
        ])
      )
    };
  });
  return updated;
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = safeReadLocalStorage<AppState>(STORAGE_KEY);
    const migrated = migrateState(stored);
    dispatch({ type: "LOAD_STATE", payload: migrated });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    safeWriteLocalStorage(STORAGE_KEY, state);
  }, [state, hydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
}

export function getWeekPlan(state: AppState, weekStartISO: string): WeeklyPlan {
  const existing = state.weeklyPlans[weekStartISO];
  const buckets = state.buckets.length ? state.buckets : DEFAULT_BUCKETS;
  if (!existing) {
    return {
      weekStartISO,
      timeBlocks: [],
      weeklyCommitments: [],
      weeklyReview: {},
      bucketTargets: { ...defaultBucketTargets(buckets) },
      dailyGoals: { ...defaultDailyGoals }
    };
  }
  const normalizedDailyGoals = { ...defaultDailyGoals };
  Object.entries(existing.dailyGoals ?? {}).forEach(([key, value]) => {
    const dayIndex = Number(key);
    if (Number.isNaN(dayIndex)) return;
    normalizedDailyGoals[dayIndex] = {
      items: Array.isArray(value.items) ? value.items : [],
      progress: typeof value.progress === "string" ? value.progress : "",
      papers: Array.isArray(value.papers) ? value.papers : []
    };
  });
  const normalizedCommitments =
    Array.isArray(existing.weeklyCommitments) && existing.weeklyCommitments.length > 0
      ? existing.weeklyCommitments.map((item) => {
          if (typeof item === "string") {
            return { id: generateId(), text: item, done: false, locked: false };
          }
          return {
            id: item.id ?? generateId(),
            text: item.text ?? "",
            done: Boolean(item.done),
            locked: Boolean(item.locked)
          };
        })
      : [];
  return {
    ...existing,
    bucketTargets: { ...defaultBucketTargets(buckets), ...existing.bucketTargets },
    dailyGoals: normalizedDailyGoals,
    weeklyCommitments: normalizedCommitments
  };
}

export function makeNewTask(partial: Partial<Task>): Task {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: partial.title ?? "",
    notes: partial.notes ?? "",
    bucket: partial.bucket ?? "research",
    outcomeId: partial.outcomeId,
    status: partial.status ?? "todo",
    estimateMinutes: partial.estimateMinutes,
    createdAt: now,
    updatedAt: now,
    dueDate: partial.dueDate
  };
}

export function makeNewGoal(partial: Partial<DirectionGoal>): DirectionGoal {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: partial.title ?? "",
    description: partial.description ?? "",
    createdAt: now
  };
}

export function makeNewOutcome(partial: Partial<Outcome>): Outcome {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: partial.title ?? "",
    description: partial.description ?? "",
    dueDate: partial.dueDate,
    status: partial.status ?? "planned",
    linkedGoalIds: partial.linkedGoalIds ?? [],
    createdAt: now
  };
}

export function makeNewLog(partial: Partial<LogEntry>): LogEntry {
  return {
    id: generateId(),
    createdAtISO: new Date().toISOString(),
    title: partial.title,
    text: partial.text ?? "",
    linkedOutcomeId: partial.linkedOutcomeId,
    linkedTaskIds: partial.linkedTaskIds ?? []
  };
}

export function makeNewBlock(partial: Partial<TimeBlock>): TimeBlock {
  return {
    id: generateId(),
    title: partial.title ?? "",
    bucket: partial.bucket ?? "research",
    dayIndex: partial.dayIndex ?? 0,
    startTime: partial.startTime ?? "09:00",
    durationMinutes: partial.durationMinutes ?? 60,
    linkedTaskIds: partial.linkedTaskIds ?? [],
    done: partial.done ?? false
  };
}
