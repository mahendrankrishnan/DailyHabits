import { FastifyInstance } from 'fastify';
import OpenAI from 'openai';
import * as habitsController from '../controllers/habits.controller.js';
import {
  aiAskJsonSchema,
  aiAskBodySchema,
  aiInsightsQuerySchema,
  aiInsightsQueryJsonSchema,
} from '../schemas/ai.schemas.js';
import { handleValidationError } from '../utils/validation.js';

function formatDateYYYYMMDD(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampToRecent7Days() {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return { startDate: formatDateYYYYMMDD(start), endDate: formatDateYYYYMMDD(end) };
}

const AIController = async (fastify: FastifyInstance) => {
  const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    return new OpenAI({ apiKey });
  };

  fastify.get<{
    Querystring: { startDate?: string; endDate?: string };
  }>('/ai/insights', {
    schema: {
      querystring: aiInsightsQueryJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            period: {
              type: 'object',
              properties: {
                startDate: { type: 'string' },
                endDate: { type: 'string' },
              },
            },
            metrics: {
              type: 'object',
              properties: {
                habitsCount: { type: 'number' },
                logsCount: { type: 'number' },
                completedCount: { type: 'number' },
                overallCompletionRate: { type: 'number' },
                bestHabit: {
                  anyOf: [
                    { type: 'null' },
                    {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        completionRate: { type: 'number' },
                      },
                    },
                  ],
                },
                needsAttentionHabit: {
                  anyOf: [
                    { type: 'null' },
                    {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        completionRate: { type: 'number' },
                      },
                    },
                  ],
                },
              },
            },
            narrative: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const parsedQuery = aiInsightsQuerySchema.parse(request.query);
      const defaultPeriod = clampToRecent7Days();
      const startDate = parsedQuery.startDate || defaultPeriod.startDate;
      const endDate = parsedQuery.endDate || defaultPeriod.endDate;

      const openai = getOpenAIClient();
      if (!openai) {
        return reply.code(500).send({
          error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.',
        });
      }

      const [habitsRes, logsRes] = await Promise.all([
        habitsController.getAllHabits(),
        habitsController.getAllLogs(startDate, endDate),
      ]);

      const allHabits = habitsRes || [];
      const allLogs = logsRes || [];

      const perHabit = allHabits.map((habit) => {
        const habitLogs = allLogs.filter((l) => l.habitId === habit.id);
        const completed = habitLogs.filter((l) => l.completed).length;
        const total = habitLogs.length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
          id: habit.id,
          name: habit.name,
          description: habit.description || null,
          color: habit.color,
          completionRate: Number(completionRate.toFixed(1)),
          completedCount: completed,
          totalCount: total,
        };
      });

      const logsCount = allLogs.length;
      const completedCount = allLogs.filter((l) => l.completed).length;
      const overallCompletionRate = logsCount > 0 ? Number(((completedCount / logsCount) * 100).toFixed(1)) : 0;

      const bestHabit = perHabit
        .filter((h) => h.totalCount > 0)
        .sort((a, b) => b.completionRate - a.completionRate)[0] ?? null;

      const needsAttentionHabit = perHabit
        .filter((h) => h.totalCount > 0)
        .sort((a, b) => a.completionRate - b.completionRate)[0] ?? null;

      const systemPrompt = `You are an assistant for a daily habits tracker.
Write a short weekly insights summary that is specific, practical, and encouraging.
Avoid fluff. Use 3-6 bullet points max. Mention best habit, habit needing attention, and 1-2 concrete next steps.`;

      const userPrompt = `Insights period: ${startDate} to ${endDate}

Aggregate metrics:
${JSON.stringify(
  {
    habitsCount: allHabits.length,
    logsCount,
    completedCount,
    overallCompletionRate,
    bestHabit: bestHabit ? { id: bestHabit.id, name: bestHabit.name, completionRate: bestHabit.completionRate } : null,
    needsAttentionHabit: needsAttentionHabit
      ? { id: needsAttentionHabit.id, name: needsAttentionHabit.name, completionRate: needsAttentionHabit.completionRate }
      : null,
  },
  null,
  2
)}

Per-habit stats:
${JSON.stringify(perHabit, null, 2)}

Return only the bullet list.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 350,
      });

      const narrative = completion.choices[0]?.message?.content?.trim()
        || 'No insights available right now.';

      return reply.code(200).send({
        period: { startDate, endDate },
        metrics: {
          habitsCount: allHabits.length,
          logsCount,
          completedCount,
          overallCompletionRate,
          bestHabit: bestHabit ? { id: bestHabit.id, name: bestHabit.name, completionRate: bestHabit.completionRate } : null,
          needsAttentionHabit: needsAttentionHabit
            ? { id: needsAttentionHabit.id, name: needsAttentionHabit.name, completionRate: needsAttentionHabit.completionRate }
            : null,
        },
        narrative,
      });
    } catch (error: any) {
      try {
        const validationError = handleValidationError(error);
        return reply.code(validationError.statusCode).send({
          error: 'Validation error',
          details: validationError.message,
        });
      } catch {
        // continue
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      return reply.code(500).send({
        error: 'Failed to generate insights',
        details: errorMessage,
      });
    }
  });

  // Ask a question about habits using NLP
  fastify.post<{
    Body: {
      question: string;
    };
  }>('/ai/ask', {
    schema: {
      body: aiAskJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            question: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' },
          },
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' },
            errorCode: { type: 'string' },
          },
        },
        429: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' },
            errorCode: { type: 'string' },
            errorType: { type: 'string' },
            hint: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' },
            errorType: { type: 'string' },
            errorCode: { type: 'string' },
            hint: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate body with Zod
      const { question } = aiAskBodySchema.parse(request.body);

      fastify.log.info({ question }, 'Received AI question request');

      const openai = getOpenAIClient();
      if (!openai) {
        fastify.log.error('OpenAI API key is not configured');
        return reply.code(500).send({ 
          error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.' 
        });
      }

      fastify.log.info('Fetching habits and logs from database...');
      // Fetch all habits and their logs for context
      const { habits: allHabits, logs: allLogs } = await habitsController.getAllHabitsAndLogs();
      fastify.log.info({ habitsCount: allHabits.length, logsCount: allLogs.length }, 'Fetched data from database');

      // Create context about habits
      const habitsContext = allHabits.map(habit => {
        const habitLogs = allLogs.filter(log => log.habitId === habit.id);
        const completedCount = habitLogs.filter(log => log.completed).length;
        const totalCount = habitLogs.length;
        const completionRate = totalCount > 0 ? (completedCount / totalCount * 100).toFixed(1) : 0;

        return {
          id: habit.id,
          name: habit.name,
          description: habit.description || 'No description',
          color: habit.color,
          createdAt: habit.createdAt instanceof Date ? habit.createdAt.toISOString() : habit.createdAt,
          totalLogs: totalCount,
          completedLogs: completedCount,
          completionRate: `${completionRate}%`
        };
      });

      // Create a prompt for OpenAI
      const systemPrompt = `You are a helpful assistant for a daily habits tracking application. 
You have access to the user's habits and their completion logs. 
Answer questions about their habits, provide insights, suggestions, and help them understand their habit tracking data.
Be friendly, concise, and helpful.`;

      const userPrompt = `Here is the user's habit data:
${JSON.stringify(habitsContext, null, 2)}

User's question: ${question}

Please provide a helpful answer based on this data.`;

      fastify.log.info('Calling OpenAI API...');
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      fastify.log.info({ completionId: completion.id }, 'OpenAI API call successful');
      const answer = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

      return { 
        answer,
        question 
      };
    } catch (error: any) {
      // Handle Zod validation errors
      try {
        const validationError = handleValidationError(error);
        return reply.code(validationError.statusCode).send({ 
          error: 'Validation error',
          details: validationError.message 
        });
      } catch {
        // Not a validation error, continue with other error handling
      }

      // Log the full error object first
      fastify.log.error({ 
        error,
        errorType: error?.constructor?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorStatus: error?.status,
        errorResponse: error?.response?.data,
        errorStack: error?.stack
      }, 'Error processing AI question - full details');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check for OpenAI API specific errors
      const errorResponse = error?.response?.data || error?.error || {};
      const errorType = errorResponse?.error?.type || errorResponse?.type || '';
      const errorCode = errorResponse?.error?.code || errorResponse?.code || error?.code || '';
      
      fastify.log.info({ errorType, errorCode, errorMessage }, 'Error classification');
      
      // Check for specific OpenAI API errors
      if (errorCode === 401 || errorMessage.includes('API key') || errorMessage.includes('Unauthorized') || errorType === 'invalid_request_error') {
        return reply.code(401).send({ 
          error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.',
          details: errorMessage,
          errorCode: errorCode || '401'
        });
      }
      
      // Check for rate limit/quota errors (429)
      // 429 can mean rate limit OR quota exceeded
      if (errorCode === 429 || error?.status === 429 || errorType === 'rate_limit_error' || 
          errorMessage.includes('429') || errorMessage.includes('exceeded your current quota')) {
        const isQuotaExceeded = errorMessage.includes('quota') || errorMessage.includes('exceeded your current quota');
        return reply.code(429).send({ 
          error: isQuotaExceeded 
            ? 'OpenAI API quota exceeded. Please check your plan and billing details at https://platform.openai.com/account/billing'
            : 'OpenAI API rate limit exceeded. Please try again later.',
          details: errorMessage,
          errorCode: errorCode || '429',
          errorType: errorType,
          hint: isQuotaExceeded 
            ? 'Visit https://platform.openai.com/account/billing to add credits or upgrade your plan.'
            : 'Rate limits reset periodically. Please wait a moment and try again.'
        });
      }
      
      // Check for quota errors - be more specific
      const quotaErrorCodes = ['insufficient_quota', 'billing_not_active', 'invalid_api_key'];
      const isQuotaError = errorCode === 'insufficient_quota' || 
                          errorType === 'insufficient_quota' ||
                          (errorResponse?.error?.code && quotaErrorCodes.includes(errorResponse.error.code)) ||
                          (errorMessage.includes('insufficient_quota') && !errorMessage.includes('rate'));
      
      if (isQuotaError) {
        return reply.code(402).send({ 
          error: 'OpenAI API quota exceeded or billing issue. Please check your OpenAI account billing and add credits.',
          details: errorMessage,
          errorCode: errorCode || errorResponse?.error?.code || 'insufficient_quota',
          errorType: errorType,
          hint: 'Visit https://platform.openai.com/account/billing to check your account status and add credits.'
        });
      }
      
      // Database connection errors
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection') || errorMessage.includes('database')) {
        return reply.code(503).send({ 
          error: 'Database connection error. Please check if the database is running.',
          details: errorMessage
        });
      }
      
      // Generic error
      return reply.code(500).send({ 
        error: 'Failed to process question', 
        details: errorMessage,
        errorType: errorType || 'unknown',
        errorCode: errorCode || 'unknown',
        hint: 'Check backend logs for more details. Common issues: invalid API key, database connection, or OpenAI API errors.'
      });
    }
  });
};

export default AIController;
