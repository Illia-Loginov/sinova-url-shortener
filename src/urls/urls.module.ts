import { Module } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { registerHooks, Url } from './schemas/url.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

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
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<Record<string, unknown>, true>,
      ) => ({
        store: new KeyvRedis(
          configService.get<string>('REDIS_URI'),
        ) as unknown as CacheStore,
      }),
    }),
  ],
  controllers: [UrlsController],
  providers: [
    UrlsService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class UrlsModule {}
