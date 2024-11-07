import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const shortenUrlSchema = z.object({
  url: z.string().url(),
});

export class ShortenUrlDto implements z.infer<typeof shortenUrlSchema> {
  @ApiProperty({
    example: 'https://docs.nestjs.com/openapi/types-and-parameters',
  })
  url: string;
}
