import type { BucketDefinition } from "./types";

export const DEFAULT_BUCKETS: BucketDefinition[] = [
  { id: "research", label: "Research (Deep Work)", color: "text-emerald-700", bg: "bg-emerald-100" },
  { id: "system", label: "System/Benchmark", color: "text-blue-700", bg: "bg-blue-100" },
  { id: "recruiting", label: "Recruiting", color: "text-purple-700", bg: "bg-purple-100" },
  { id: "classes", label: "Classes", color: "text-amber-700", bg: "bg-amber-100" },
  { id: "life", label: "Life/Admin", color: "text-rose-700", bg: "bg-rose-100" }
];

const COLOR_POOL = [
  { color: "text-emerald-700", bg: "bg-emerald-100" },
  { color: "text-blue-700", bg: "bg-blue-100" },
  { color: "text-purple-700", bg: "bg-purple-100" },
  { color: "text-amber-700", bg: "bg-amber-100" },
  { color: "text-rose-700", bg: "bg-rose-100" },
  { color: "text-teal-700", bg: "bg-teal-100" },
  { color: "text-sky-700", bg: "bg-sky-100" }
];

export const getNextBucketColors = (index: number) => COLOR_POOL[index % COLOR_POOL.length];

export const bucketStyle = (buckets: BucketDefinition[], id: string) =>
  buckets.find((b) => b.id === id) ?? buckets[0];
