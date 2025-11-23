// src/schemas/habits.schemas.ts
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Common schemas
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a valid number').transform((val) => parseInt(val, 10)),
});

export const searchQuerySchema = z.object({
  search: z.string().optional(),
});

export const dateRangeQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  }
);

// Habit schemas
export const createHabitBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters').trim(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').trim().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #3b82f6)').optional(),
});

export const updateHabitBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters').trim().optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').trim().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #3b82f6)').optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
  }
);

// Habit Log schemas
export const createHabitLogBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  completed: z.boolean(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').trim().optional().nullable(),
});

// Response schemas (for documentation/type safety)
export const habitResponseSchema = z.object({
  habit: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    color: z.string(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()),
  }),
});

export const habitsResponseSchema = z.object({
  habits: z.array(habitResponseSchema.shape.habit),
});

export const habitLogResponseSchema = z.object({
  log: z.object({
    id: z.number(),
    habitId: z.number(),
    date: z.string(),
    completed: z.boolean(),
    notes: z.string().nullable(),
    createdAt: z.date().or(z.string()),
  }),
});

export const habitLogsResponseSchema = z.object({
  logs: z.array(habitLogResponseSchema.shape.log),
});

export const logsResponseSchema = z.object({
  logs: z.array(habitLogResponseSchema.shape.log),
});

export const predefinedHabitsResponseSchema = z.object({
  habits: z.array(z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    color: z.string(),
    displayOrder: z.number(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()),
  })),
});

// JSON Schema exports for Fastify
export const createHabitJsonSchema = zodToJsonSchema(createHabitBodySchema as any, 'createHabitBody');
export const updateHabitJsonSchema = zodToJsonSchema(updateHabitBodySchema as any, 'updateHabitBody');
export const idParamJsonSchema = zodToJsonSchema(idParamSchema as any, 'idParam');
export const searchQueryJsonSchema = zodToJsonSchema(searchQuerySchema as any, 'searchQuery');
export const dateRangeQueryJsonSchema = zodToJsonSchema(dateRangeQuerySchema as any, 'dateRangeQuery');
export const createHabitLogJsonSchema = zodToJsonSchema(createHabitLogBodySchema as any, 'createHabitLogBody');

