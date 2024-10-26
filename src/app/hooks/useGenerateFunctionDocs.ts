"use client";

import { parseStatus } from "@/lib/metadataStore";
import { type generateFunctionDocs } from "@/trigger/tasks";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

interface GenerateFunctioDocsStatus {
  state: "running" | "completed";
  progress: number;
  label: string;
  output?: string;
}

/**
 * Hook that subscribes to the generateFunctionDocs task and returns the status and output of the task.
 *
 * Uses the `useRealtimeRun` hook to subscribe to the task.
 *
 * See more about the `useRealtimeRun` hook in the [Trigger docs](https://trigger.dev/docs/frontend/react-hooks#userealtimerun).
 *
 * @param id the run id of the generateFunctionDocs task
 */
export function useGenerateFunctionDocs(id: string) {
  const { run, error } = useRealtimeRun<typeof generateFunctionDocs>(id);

  const status: GenerateFunctioDocsStatus = {
    state: run?.status === "COMPLETED" ? "completed" : "running",
    progress: 0,
    label: "Initializing...",
    output: run?.output?.result ?? undefined,
  };

  // Parse metadata if available
  if (run?.metadata) {
    const { progress, label } = parseStatus(run.metadata);
    status.progress = progress;
    status.label = label;
  }

  return {
    status,
    error,
    run,
  };
}
