import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Url } from './schemas/url.schema';
import { Model } from 'mongoose';

@Injectable()
export class UrlsService {
  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {}

  create(url: string) {
    return 'short url of ' + url;
  }

  redirect(code: string) {
    return 'redirect to original url of ' + code;
  }

  stats(code: string) {
    return 'stats of ' + code;
  }
}
