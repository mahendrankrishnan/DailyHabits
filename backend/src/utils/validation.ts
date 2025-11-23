// src/utils/validation.ts
import { ZodError } from 'zod';

export function formatZodError(error: ZodError): string {
  return error.issues
    .map((err) => {
      const path = err.path.join('.');
      return path ? `${path}: ${err.message}` : err.message;
    })
    .join(', ');
}

export function handleValidationError(error: unknown): { statusCode: number; message: string } {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      message: formatZodError(error),
    };
  }
  throw error;
}

