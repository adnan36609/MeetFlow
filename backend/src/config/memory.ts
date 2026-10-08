import { PostgresStore } from "@mastra/pg";
import { Memory } from "@mastra/memory";

export const memoryStore = new PostgresStore({
  id: "memory-assistant-memory",
  connectionString: process.env.DATABASE_URL,
});

export function createAgentMemory() {
  return new Memory({
    storage: memoryStore,
    options: {
      lastMessages: 20,
      workingMemory: {
        enabled: true,
        scope: "resource",
        template: `#Meeting Preferences
                -Timezone: 
                -Default meeting length (minutes):
                -Preferred meeting hours:
                -Usual invitees:
                -Notes:
                `,
      },
    },
  });
}
