import { metadata } from "@trigger.dev/sdk/v3";
import { z } from "zod";

const GenerateFunctionDocsStatus = z.object({
  progress: z.number(),
  label: z.string(),
});

type GenerateFunctionDocsStatus = z.infer<typeof GenerateFunctionDocsStatus>;

const GenerateFunctionDocsMetadata = z.object({
  status: GenerateFunctionDocsStatus,
});

type GenerateFunctionDocsMetadata = z.infer<
  typeof GenerateFunctionDocsMetadata
>;

/**
 * Update the status of the generate function docs task. Wraps the `metadata.set` method.
 */
export function updateStatus(status: GenerateFunctionDocsStatus) {
  // `metadata.set` can be used to update the status of the task
  // as long as `updateStatus` is called within the task's `run` function.
  metadata.set("status", status);
}

/**
 * Parse the status from the metadata.
 *
 * Used by the `useGenerateFunctionDocs` hook to parse the status
 */
export function parseStatus(data: unknown): GenerateFunctionDocsStatus {
  return GenerateFunctionDocsMetadata.parse(data).status;
}
