import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url } from './schemas/url.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UrlsService {
  constructor(
    @InjectModel(Url.name) private urlModel: Model<Url>,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async getCodeByUrl(url: string) {
    const oldDBMapping = await this.urlModel
      .findOne({ url })
      .select(['code', '-_id'])
      .lean()
      .exec();

    if (oldDBMapping) {
      return oldDBMapping.code;
    }

    const newDBMapping = await this.urlModel.create({ url, clickCount: 0 });

    return newDBMapping.code;
  }

  async shortenUrl(url: string) {
    const code = await this.getCodeByUrl(url);

    await this.cacheManager.set(`code:${code}`, url);

    return `${this.configService.get<string>('SERVER_URL')}/${code}`;
  }

  async getUrlByCode(code: string) {
    const cachedUrl = await this.cacheManager.get<string>(`code:${code}`);

    if (cachedUrl) {
      this.urlModel
        .updateOne({ code }, { $inc: { clickCount: 1 } })
        .catch((error) => console.error(error));

      return cachedUrl;
    }

    const storedMapping = await this.urlModel
      .findOneAndUpdate({ code }, { $inc: { clickCount: 1 } })
      .select(['url', '-_id'])
      .lean()
      .exec();

    return storedMapping?.url;
  }

  async getStatsByCode(code: string) {
    return this.urlModel
      .findOne({ code })
      .select(['url', 'code', 'clickCount', '-_id'])
      .lean()
      .exec();
  }
}
