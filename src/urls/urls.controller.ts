import {
  Body,
  Controller,
  Get,
  HttpRedirectResponse,
  NotFoundException,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { ZodValidationPipe } from '../utils/ZodValidationPipe';
import { ShortenUrlDto, shortenUrlSchema } from './dto/shorten-url.dto';
import { CodeDto, codeSchema } from './dto/code.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiMovedPermanentlyResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { StatsResponseDto } from './dto/stats-response.dto';

@Controller()
@ApiTooManyRequestsResponse({ description: 'Reached request rate limit' })
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
  @ApiOperation({
    summary: 'Create a short URL which redirects to the provided URL',
  })
  @ApiCreatedResponse({
    description: 'Shortened URL (created new mapping or found existing one)',
    schema: {
      type: 'string',
      example: 'SERVER_URL/abc123',
    },
  })
  @ApiBadRequestResponse({
    description: 'Request body validation failed',
  })
  async shortenUrl(
    @Body(new ZodValidationPipe(shortenUrlSchema)) { url }: ShortenUrlDto,
  ) {
    return this.urlsService.shortenUrl(url);
  }

  @Get(':code')
  @Redirect()
  @ApiOperation({ summary: 'Get redirected to the original URL' })
  @ApiParam({ name: 'code', example: 'abc123' })
  @ApiMovedPermanentlyResponse({
    description: 'Redirect to original URL (and increment click count)',
  })
  @ApiNotFoundResponse({
    description: 'No shortened URL with provided code has been found',
  })
  @ApiBadRequestResponse({ description: 'Request query validation failed' })
  async redirect(
    @Param('code', new ZodValidationPipe(codeSchema)) code: CodeDto,
  ): Promise<HttpRedirectResponse> {
    const url = await this.urlsService.getUrlByCode(code);

    if (!url) {
      throw new NotFoundException({ message: 'URL not found' });
    }

    return { url, statusCode: 301 };
  }

  @Get('stats/:code')
  @ApiOperation({ summary: 'Get stats of the URL-shortened URL mapping' })
  @ApiParam({ name: 'code', example: 'abc123' })
  @ApiOkResponse({
    description: 'Stats for provided shortened URL',
    type: StatsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No shortened URL with provided code has been found',
  })
  @ApiBadRequestResponse({ description: 'Request query validation failed' })
  async stats(@Param('code', new ZodValidationPipe(codeSchema)) code: CodeDto) {
    const stats = await this.urlsService.getStatsByCode(code);

    if (!stats) {
      throw new NotFoundException({ message: 'URL not found' });
    }

    return stats;
  }
}
