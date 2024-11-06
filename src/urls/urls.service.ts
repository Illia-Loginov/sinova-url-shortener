import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url } from './schemas/url.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlsService {
  constructor(
    @InjectModel(Url.name) private urlModel: Model<Url>,
    private configService: ConfigService,
  ) {}

  async create(url: string) {
    const newUrl = await this.urlModel.create({ url, clickCount: 0 });

    return `${this.configService.get<string>('SERVER_URL')}/${newUrl.code}`;
  }

  redirect(code: string) {
    return 'redirect to original url of ' + code;
  }

  stats(code: string) {
    return 'stats of ' + code;
  }
}
