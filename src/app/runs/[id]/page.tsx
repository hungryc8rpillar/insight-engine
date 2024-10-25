import { GenerateFunctionDocs } from "@/components/GenerateFunctionDocs";
import { TriggerProvider } from "@/components/TriggerProvider";
import { generatePublicAccessToken } from "@/lib/trigger";

export default async function RunPage({ params }: { params: { id: string } }) {
  const publicAccessToken = await generatePublicAccessToken(params.id);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <TriggerProvider accessToken={publicAccessToken}>
        <GenerateFunctionDocs id={params.id} />
      </TriggerProvider>
    </main>
  );
}
