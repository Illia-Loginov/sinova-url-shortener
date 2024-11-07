import { ApiProperty } from '@nestjs/swagger';

export class StatsResponseDto {
  @ApiProperty({
    example: 'https://docs.nestjs.com/openapi/operations#responses',
  })
  url: string;

  @ApiProperty({ example: 'abc123' })
  code: string;

  @ApiProperty({ example: 322 })
  clickCount: number;
}
