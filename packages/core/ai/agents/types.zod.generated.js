// Generated by ts-to-zod
import { contentSchema } from "../core/types.autogen.zod.js";
import { z } from "zod";

export const agentRunParametersSchema = z
  .object({
    thread_id: z
      .string()
      .optional()
      .describe("The `thread` / `conversation` identifier"),
    maxLatestHistoryToUse: z.number().optional().default(5),
    prompt: z.array(contentSchema).describe("Current customer prompt"),
    maxTokens: z.number().optional().describe("Max tokens"),
    maxSteps: z
      .number()
      .optional()
      .describe("The maximum amount of steps to iterate"),
    metadata: z
      .object({
        customer_id: z.string().optional().describe("The customer `id`"),
        customer_email: z.string().optional().describe("The customer `email`"),
        search: z
          .array(z.string())
          .optional()
          .describe("Extra search terms to index in the database."),
        extra: z
          .record(z.any().describe("Extra metadata coming from consumer."))
          .optional()
          .describe("Extra metadata coming from consumer."),
      })
      .optional()
      .describe(
        "Extra metadata to pass to the agent,\nadvised to be saved for spicing it's behaviour,\nobservability and debugging purposes.",
      ),
  })
  .describe("Parameters for the `storecraft` agent");

export const agentRunResponseSchema = z
  .object({
    contents: z.array(contentSchema).describe("Current **LLM** formatted responses"),
    thread_id: z
      .string()
      .optional()
      .describe("The `thread` / `conversation` identifier"),
  })
  .describe("Response for the `storecraft` agent");
