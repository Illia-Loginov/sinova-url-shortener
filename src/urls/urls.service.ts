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

  private async getCodeByUrl(url: string) {
    const result = await this.urlModel
      .findOne({ url })
      .select(['code', '-_id'])
      .lean()
      .exec();

    return result?.code;
  }

  private shortenedUrl(code: string) {
    return `${this.configService.get<string>('SERVER_URL')}/${code}`;
  }

  async create(url: string) {
    const oldCode = await this.getCodeByUrl(url);

    if (oldCode) {
      return this.shortenedUrl(oldCode);
    }

    const newUrl = await this.urlModel.create({ url, clickCount: 0 });

    return this.shortenedUrl(newUrl.code);
  }

  async getUrlByCode(code: string) {
    const result = await this.urlModel
      .findOneAndUpdate({ code }, { $inc: { clickCount: 1 } })
      .select(['url', '-_id'])
      .lean()
      .exec();

    return result?.url;
  }

  async getStatsByCode(code: string) {
    return this.urlModel
      .findOne({ code })
      .select(['url', 'code', 'clickCount', '-_id'])
      .lean()
      .exec();
  }
}
