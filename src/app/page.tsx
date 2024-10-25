import { Button } from "@/components/ui/button";
import { startRun } from "@/app/actions";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold">
        Next.js + Trigger.dev Realtime demo
      </h1>
      <form action={startRun}>
        <Button type="submit" size="lg">
          Start New Run
        </Button>
      </form>
    </main>
  );
}
