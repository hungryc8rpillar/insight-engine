"use client";

import { ExampleMetadataSchema } from "@/lib/schemas";
import { type generateFunctionDocs } from "@/trigger/tasks";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

interface GenerateFunctioDocsStatus {
  state: "running" | "completed";
  progress: number;
  label: string;
  output?: string;
}

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
    const metadata = ExampleMetadataSchema.parse(run.metadata);
    status.progress = metadata.status.progress;
    status.label = metadata.status.label;
  }

  return {
    status,
    error,
    run,
  };
}
