import { z } from 'zod';

const envValidationSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
});

export const validate = (config: Record<string, unknown>) =>
  envValidationSchema.parse(config);
