import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';
import { formatZodError } from './formatZodError';
import { toCapitalized } from './stringFormatting';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: `${toCapitalized(metadata.type)} validation failed`,
          issues: formatZodError(error),
        });
      }

      throw error;
    }
  }
}
