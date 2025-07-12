import { TaskProgress } from "@/components/TaskProgress";
import { TriggerProvider } from "@/components/TriggerProvider";
import { generatePublicAccessToken } from "@/lib/trigger";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

export default async function RunPage({ params }: { params: { id: string } }) {
  const publicAccessToken = await generatePublicAccessToken(params.id);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <TriggerProvider accessToken={publicAccessToken}>
        <TaskProgress 
          id={params.id}
          title="Processing Task"
          description="Your task is being processed in the background. This may take a few moments."
        />
      </TriggerProvider>
    </main>
  );
}
