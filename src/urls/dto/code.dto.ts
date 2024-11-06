import { z } from 'zod';

export const codeSchema = z
  .string()
  .min(1)
  .max(6)
  .regex(/^[a-z0-9]{1,6}$/, { message: 'Invalid code' });

export type CodeDto = z.infer<typeof codeSchema>;
