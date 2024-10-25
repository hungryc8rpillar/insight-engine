"use client";

import { useGenerateFunctionDocs } from "@/app/hooks/useGenerateFunctionDocs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function GenerateFunctionDocs({ id }: { id: string }) {
  const { status } = useGenerateFunctionDocs(id);

  if (status.state === "completed") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Run Completed</h2>
          <p className="text-center">
            Your run has finished successfully. Here are the results:
          </p>
          <div className="mt-4 p-4 bg-muted rounded-md">
            <pre className="text-xs">
              {status.output || "No results available."}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Run in Progress</h2>
        <Progress value={status.progress} className="w-full" />
        <p className="mt-4 text-center text-muted-foreground">{status.label}</p>
      </CardContent>
    </Card>
  );
}
