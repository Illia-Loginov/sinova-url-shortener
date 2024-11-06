import { formatZodError } from 'src/utils/formatZodError';
import { z, ZodError } from 'zod';

const envValidationSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  SERVER_URL: z.string().url(),
  MONGO_URI: z.string().url(),
  REDIS_URI: z.string().url(),
});

class EnvValidationError extends Error {
  constructor(error: ZodError) {
    super();

    this.name = 'EnvValidationError';
    this.message = JSON.stringify(formatZodError(error), null, 2);
  }
}

export const validate = (config: Record<string, unknown>) => {
  try {
    return envValidationSchema.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new EnvValidationError(error);
    }

    throw error;
  }
};
