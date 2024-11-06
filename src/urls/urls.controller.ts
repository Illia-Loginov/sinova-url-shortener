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
import { ZodValidationPipe } from 'src/utils/ZodValidationPipe';
import { CreateUrlDto, createUrlSchema } from './dto/create-url.dto';
import { CodeDto, codeSchema } from './dto/code.dto';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
  async create(
    @Body(new ZodValidationPipe(createUrlSchema)) { url }: CreateUrlDto,
  ) {
    return this.urlsService.create(url);
  }

  @Get(':code')
  @Redirect()
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
  async stats(@Param('code', new ZodValidationPipe(codeSchema)) code: CodeDto) {
    const stats = await this.urlsService.getStatsByCode(code);

    if (!stats) {
      throw new NotFoundException({ message: 'URL not found' });
    }

    return stats;
  }
}
