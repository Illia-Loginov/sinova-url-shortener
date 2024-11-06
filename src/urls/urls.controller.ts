import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UrlsService } from './urls.service';

@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
  create(@Body() { url }: { url: string }) {
    return this.urlsService.create(url);
  }

  @Get(':code')
  redirect(@Param('code') code: string) {
    const url = this.urlsService.redirect(code);

    // TODO: redirect

    return url;
  }

  @Get('stats/:code')
  stats(@Param('code') code: string) {
    return this.urlsService.stats(code);
  }
}
