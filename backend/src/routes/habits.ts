import { FastifyInstance } from 'fastify';
import * as habitsController from '../controllers/habits.controller.js';
import {
  createHabitJsonSchema,
  updateHabitJsonSchema,
  idParamJsonSchema,
  searchQueryJsonSchema,
  dateRangeQueryJsonSchema,
  createHabitLogJsonSchema,
  createHabitBodySchema,
  updateHabitBodySchema,
  idParamSchema,
  createHabitLogBodySchema,
} from '../schemas/habits.schemas.js';
import { handleValidationError } from '../utils/validation.js';

const HabitController = async (fastify: FastifyInstance) => {
  // Get all habits with optional search
  fastify.get<{
    Querystring: { search?: string };
  }>('/habits', {
    schema: {
      querystring: searchQueryJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            habits: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  description: { type: ['string', 'null'] },
                  color: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { search } = request.query;
      const allHabits = await habitsController.getAllHabits(search);
      return reply.code(200).send({ habits: allHabits });
    } catch (error) {
      fastify.log.error({ error }, 'Error fetching habits');
      return reply.code(500).send({ 
        error: 'Failed to fetch habits', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get a single habit by ID
  fastify.get<{
    Params: { id: string };
  }>('/habits/:id', {
    schema: {
      params: idParamJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            habit: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                description: { type: ['string', 'null'] },
                color: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate and parse params
      const params = idParamSchema.parse(request.params);
      const habit = await habitsController.getHabitById(params.id);
      
      if (!habit) {
        return reply.code(404).send({ error: 'Habit not found' });
      }
      
      return reply.code(200).send({ habit });
    } catch (error) {
      try {
        const validationError = handleValidationError(error);
        return reply.code(validationError.statusCode).send({ 
          error: 'Validation error',
          details: validationError.message 
        });
      } catch {
        fastify.log.error({ error }, 'Error fetching habit');
        return reply.code(500).send({ 
          error: 'Failed to fetch habit',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Create a new habit
  fastify.post<{
    Body: {
      name: string;
      description?: string;
      color?: string;
    };
  }>('/habits', {
    schema: {
      body: createHabitJsonSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            habit: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                description: { type: ['string', 'null'] },
                color: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate body with Zod
      const body = createHabitBodySchema.parse(request.body);

      const newHabit = await habitsController.createHabit({
        name: body.name,
        description: body.description,
        color: body.color,
      });
      
      return reply.code(201).send({ habit: newHabit });
    } catch (error) {
      try {
        const validationError = handleValidationError(error);
        return reply.code(validationError.statusCode).send({ 
          error: 'Validation error',
          details: validationError.message 
        });
      } catch {
        fastify.log.error({ error }, 'Error creating habit');
        return reply.code(500).send({ 
          error: 'Failed to create habit',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Update a habit
  fastify.put<{
    Params: { id: string };
    Body: {
      name?: string;
      description?: string;
      color?: string;
    };
  }>('/habits/:id', {
    schema: {
      params: idParamJsonSchema,
      body: updateHabitJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            habit: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                description: { type: ['string', 'null'] },
                color: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate params and body
      const params = idParamSchema.parse(request.params);
      const body = updateHabitBodySchema.parse(request.body);

      const updatedHabit = await habitsController.updateHabit(params.id, body);
      
      if (!updatedHabit) {
        return reply.code(404).send({ error: 'Habit not found' });
      }
      
      return reply.code(200).send({ habit: updatedHabit });
    } catch (error) {
      try {
        const validationError = handleValidationError(error);
        return reply.code(validationError.statusCode).send({ 
          error: 'Validation error',
          details: validationError.message 
        });
      } catch {
        fastify.log.error({ error }, 'Error updating habit');
        return reply.code(500).send({ 
          error: 'Failed to update habit',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Delete a habit
  fastify.delete<{
    Params: { id: string };
  }>('/habits/:id', {
    schema: {
      params: idParamJsonSchema,
      response: {
        204: {},
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate params
      const params = idParamSchema.parse(request.params);

      const result = await habitsController.deleteHabit(params.id);
      
      if (result.length === 0) {
        return reply.code(404).send({ error: 'Habit not found' });
      }
      
      return reply.code(204).send();
    } catch (error) {
      try {
        const validationError = handleValidationError(error);
        return reply.code(validationError.statusCode).send({ 
          error: 'Validation error',
          details: validationError.message 
        });
      } catch {
        fastify.log.error({ error }, 'Error deleting habit');
        return reply.code(500).send({ 
          error: 'Failed to delete habit',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Get habit logs for a specific habit
  fastify.get<{
    Params: { id: string };
  }>('/habits/:id/logs', {
    schema: {
      params: idParamJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            logs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  habitId: { type: 'number' },
                  date: { type: 'string' },
                  completed: { type: 'boolean' },
                  notes: { type: ['string', 'null'] },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate params
      const params = idParamSchema.parse(request.params);

      const logs = await habitsController.getHabitLogs(params.id);
      return reply.code(200).send({ logs });
    } catch (error) {
      try {
        const validationError = handleValidationError(error);
        return reply.code(validationError.statusCode).send({ 
          error: 'Validation error',
          details: validationError.message 
        });
      } catch {
        fastify.log.error({ error }, 'Error fetching habit logs');
        return reply.code(500).send({ 
          error: 'Failed to fetch habit logs',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Log a habit completion
  fastify.post<{
    Params: { id: string };
    Body: {
      date: string;
      completed: boolean;
      notes?: string;
    };
  }>('/habits/:id/logs', {
    schema: {
      params: idParamJsonSchema,
      body: createHabitLogJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            log: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                habitId: { type: 'number' },
                date: { type: 'string' },
                completed: { type: 'boolean' },
                notes: { type: ['string', 'null'] },
                createdAt: { type: 'string' },
              },
            },
          },
        },
        201: {
          type: 'object',
          properties: {
            log: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                habitId: { type: 'number' },
                date: { type: 'string' },
                completed: { type: 'boolean' },
                notes: { type: ['string', 'null'] },
                createdAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate params and body
      const params = idParamSchema.parse(request.params);
      const body = createHabitLogBodySchema.parse(request.body);

      const result = await habitsController.createOrUpdateHabitLog(params.id, {
        date: body.date,
        completed: body.completed,
        notes: body.notes,
      });
      
      return reply.code(result.created ? 201 : 200).send({ log: result.log });
    } catch (error) {
      try {
        const validationError = handleValidationError(error);
        return reply.code(validationError.statusCode).send({ 
          error: 'Validation error',
          details: validationError.message 
        });
      } catch {
        fastify.log.error({ error }, 'Error logging habit');
        return reply.code(500).send({ 
          error: 'Failed to log habit',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Get all logs for a date range
  fastify.get<{
    Querystring: { startDate?: string; endDate?: string };
  }>('/logs', {
    schema: {
      querystring: dateRangeQueryJsonSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            logs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  habitId: { type: 'number' },
                  date: { type: 'string' },
                  completed: { type: 'boolean' },
                  notes: { type: ['string', 'null'] },
                  createdAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { startDate, endDate } = request.query;
      const logs = await habitsController.getAllLogs(startDate, endDate);
      return reply.code(200).send({ logs });
    } catch (error) {
      fastify.log.error({ error }, 'Error fetching logs');
      return reply.code(500).send({ 
        error: 'Failed to fetch logs',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get all predefined habits
  fastify.get<{}>('/predefined-habits', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            habits: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  description: { type: ['string', 'null'] },
                  color: { type: 'string' },
                  displayOrder: { type: 'number' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const allPredefined = await habitsController.getAllPredefinedHabits();
      return reply.code(200).send({ habits: allPredefined });
    } catch (error) {
      fastify.log.error({ error }, 'Error fetching predefined habits');
      return reply.code(500).send({ 
        error: 'Failed to fetch predefined habits', 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });
};

export default HabitController;
