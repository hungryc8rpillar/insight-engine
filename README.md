This is a [Next.js](https://nextjs.org) demo project that uses [Trigger.dev Realtime](https://trigger.dev/docs/realtime) and the Trigger.dev [React Hooks](https://trigger.dev/docs/frontend/react-hooks) to perform a background task that updates the page in real-time.

## Getting Started

If you haven't already, sign up for a free account at [Trigger.dev](https://trigger.dev) and create a new project. Update the project reference in `trigger.config.ts` with your project's reference.

Then, copy the `.env.local.example` file to `.env.local` and update the `TRIGGER_API_KEY` with your API key and the `OPENAI_API_KEY` with your OpenAI API key.

```bash
TRIGGER_API_KEY=your-api-key
OPENAI_API_KEY=your-openai-api-key
```

Next, run the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

And in a new terminal window, run the Trigger.dev CLI:

```bash
npx trigger.dev@latest dev
```

### Relevant Files

- `src/trigger/tasks.ts`: Where our `generateFunctionDocs` background task is defined.
- `src/lib/metadataStore.ts`: Wraps the run metadata with type-safe access.
- `src/app/page.tsx`: The main page that invokes the server action function that triggers the background task.
- `src/app/actions.ts`: The server action function that triggers the background task and redirects to `/runs/[id]`.
- `src/app/runs/[id]/page.tsx`: The page that displays the status of the background task and the result when it's done.
- `src/app/hooks/useGenerateFunctionDocs.ts`: A custom React Hook that uses the Trigger.dev React Hooks to fetch the function documentation in real-time.
- `src/app/components/GenerateFunctionDocs.tsx`: A component that uses the `useGenerateFunctionDocs` hook to display the function documentation in real-time.
