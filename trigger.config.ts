import { defineConfig } from "@trigger.dev/sdk/v3";
import { config } from "dotenv";

// Load environment variables from .env file
config();
export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID || "your-project-id",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
});
