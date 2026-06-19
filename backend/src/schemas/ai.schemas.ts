// src/schemas/ai.schemas.ts
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const aiAskBodySchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000, 'Question must be less than 1000 characters').trim(),
});

export const aiAskResponseSchema = z.object({
  answer: z.string(),
  question: z.string(),
});

export const aiInsightsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const aiInsightsResponseSchema = z.object({
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  metrics: z.object({
    habitsCount: z.number(),
    logsCount: z.number(),
    completedCount: z.number(),
    overallCompletionRate: z.number(),
    bestHabit: z.object({
      id: z.number(),
      name: z.string(),
      completionRate: z.number(),
    }).nullable(),
    needsAttentionHabit: z.object({
      id: z.number(),
      name: z.string(),
      completionRate: z.number(),
    }).nullable(),
  }),
  narrative: z.string(),
});

// JSON Schema exports for Fastify
export const aiAskJsonSchema = zodToJsonSchema(aiAskBodySchema as any, 'aiAskBody');
export const aiInsightsQueryJsonSchema = zodToJsonSchema(aiInsightsQuerySchema as any, 'aiInsightsQuery');

