import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import { setTimeout } from "timers/promises";
import { OpenAI } from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateFunctionDocs = schemaTask({
  id: "generate-function-docs",
  schema: z.object({
    name: z.string(),
    code: z.string(),
  }),
  maxDuration: 300, // 5 minutes
  run: async (payload, { ctx }) => {
    metadata.set("status", { progress: 0, label: "Initializing..." });

    await setTimeout(1000);

    metadata.set("status", { progress: 19, label: "Processing data..." });

    await setTimeout(1000);

    metadata.set("status", { progress: 45, label: "Analyzing results..." });

    await setTimeout(1000);

    const prompt = `Generate a jsdoc documentation comment for the following TypeScript/JavaScript code. Focus on describing parameters, return values, and purpose. Don't modify the code itself. Code: \`\`\`js\n${payload.code}\n\`\`\``;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "chatgpt-4o-latest",
    });

    metadata.set("status", { progress: 85, label: "Finalizing..." });

    await setTimeout(1000);

    return {
      result: completion.choices[0].message.content,
    };
  },
});
