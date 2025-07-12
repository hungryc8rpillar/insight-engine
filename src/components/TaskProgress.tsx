"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { parseStatus } from "@/lib/metadataStore";
import Link from "next/link";

interface TaskStatus {
  state: "running" | "completed" | "failed";
  progress: number;
  label: string;
  output?: any;
  error?: string;
}

interface TaskProgressProps {
  id: string;
  title?: string;
  description?: string;
}

export function TaskProgress({ id, title = "Task in Progress", description }: TaskProgressProps) {
  const { run, error } = useRealtimeRun(id);

  const status: TaskStatus = {
    state: run?.status === "COMPLETED" ? "completed" : 
           run?.status === "FAILED" ? "failed" : "running",
    progress: 0,
    label: "Initializing...",
    output: run?.output,
    error: error?.message,
  };

  // Parse metadata if available
  if (run?.metadata) {
    try {
      const { progress, label } = parseStatus(run.metadata);
      status.progress = progress;
      status.label = label;
    } catch {
      // If metadata parsing fails, use default values
      status.progress = run?.status === "COMPLETED" ? 100 : 0;
      status.label = run?.status === "COMPLETED" ? "Completed" : "Processing...";
    }
  }

  if (status.state === "completed") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Task Completed</h2>
          <p className="text-center mb-4">
            {description || "Your task has finished successfully."}
          </p>
          {status.output && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <pre className="text-xs whitespace-pre-wrap">
                {typeof status.output === 'string' 
                  ? status.output 
                  : JSON.stringify(status.output, null, 2)
                }
              </pre>
            </div>
          )}
          <div className="mt-6 text-center">
            <Link href="/">
              <Button>
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status.state === "failed") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Task Failed</h2>
          <p className="text-center text-red-600 mb-4">
            {status.error || "An error occurred while processing your task."}
          </p>
          <div className="mt-6 text-center">
            <Link href="/">
              <Button>
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        <Progress value={status.progress} className="w-full" />
        <p className="mt-4 text-center text-muted-foreground">{status.label}</p>
        {description && (
          <p className="mt-2 text-center text-sm text-gray-500">{description}</p>
        )}
      </CardContent>
    </Card>
  );
} 