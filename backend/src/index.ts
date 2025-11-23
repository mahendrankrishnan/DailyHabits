import Fastify from 'fastify';
import cors from '@fastify/cors';
import HabitController from './routes/habits.js';
import AIController from './routes/ai.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function start() {
  const fastify = Fastify({
    logger: true,
  });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error({ error }, 'Global error handler');
    reply.code(error.statusCode || 500).send({
      error: error.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });

  // Here I am registering CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // havr to register the routes here
  await fastify.register(HabitController);
  await fastify.register(AIController);

  // Start server
  const port = parseInt(process.env.PORT || '3010');
  const host = '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();

