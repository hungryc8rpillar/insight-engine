"use server";

import { tasks } from "@trigger.dev/sdk/v3";
import type { generateFunctionDocs } from "@/trigger/tasks";
import { redirect } from "next/navigation";

export async function startRun() {
  const handle = await tasks.trigger<typeof generateFunctionDocs>(
    "generate-function-docs",
    {
      name: startRun.name,
      code: startRun.toString(),
    },
    {
      tags: ["user:1234"],
    }
  );

  redirect(`/runs/${handle.id}`);
}
