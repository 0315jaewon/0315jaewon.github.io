export type Bucket = string;

export type BucketDefinition = {
  id: string;
  label: string;
  color: string;
  bg: string;
};

export type DirectionGoal = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

export type OutcomeStatus = "planned" | "active" | "done";

export type Outcome = {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  status: OutcomeStatus;
  linkedGoalIds: string[];
  createdAt: string;
};

export type TaskStatus = "todo" | "doing" | "done";

export type Task = {
  id: string;
  title: string;
  notes?: string;
  bucket: Bucket;
  outcomeId?: string;
  status: TaskStatus;
  estimateMinutes?: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
};

export type TimeBlock = {
  id: string;
  title: string;
  bucket: Bucket;
  dayIndex: number;
  startTime: string;
  durationMinutes: number;
  linkedTaskIds: string[];
  done: boolean;
};

export type WeeklyReview = {
  score0to10?: number;
  wentWell?: string;
  improve?: string;
  nextWeekFocus?: string;
  locked?: boolean;
};

export type DailyGoalItem = {
  id: string;
  text: string;
  done: boolean;
};

export type DailyFocus = {
  items: DailyGoalItem[];
  progress: string;
  papers: DailyGoalItem[];
};

export type WeeklyPlan = {
  weekStartISO: string;
  timeBlocks: TimeBlock[];
  weeklyCommitments: { id: string; text: string; done: boolean; locked: boolean }[];
  weeklyReview: WeeklyReview;
  bucketTargets: Record<Bucket, number>;
  dailyGoals: Record<number, DailyFocus>;
};

export type LogEntry = {
  id: string;
  createdAtISO: string;
  title?: string;
  text: string;
  linkedOutcomeId?: string;
  linkedTaskIds?: string[];
};

export type AppState = {
  storageVersion: number;
  buckets: BucketDefinition[];
  goals: DirectionGoal[];
  outcomes: Outcome[];
  tasks: Task[];
  weeklyPlans: Record<string, WeeklyPlan>;
  logs: LogEntry[];
  northStarOutcomeId?: string;
  ui: {
    taskModalOpen: boolean;
    logModalOpen: boolean;
    dataModalOpen: boolean;
  };
};
