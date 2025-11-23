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

// JSON Schema exports for Fastify
export const aiAskJsonSchema = zodToJsonSchema(aiAskBodySchema as any, 'aiAskBody');

