import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { registerHooks, Url } from './schemas/url.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Url.name,
        useFactory: registerHooks,
        imports: [
          MongooseModule.forFeature([
            { name: Counter.name, schema: CounterSchema },
          ]),
        ],
        inject: [getModelToken(Counter.name)],
      },
      { name: Counter.name, useFactory: () => CounterSchema },
    ]),
  ],
  controllers: [UrlsController],
  providers: [UrlsService],
})
export class UrlsModule {}
