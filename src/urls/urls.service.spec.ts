import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './urls.service';
import { Url } from './schemas/url.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const urlMapping: Url = {
  url: 'https://docs.nestjs.com/techniques/mongodb#testing',
  code: 'ac',
  clickCount: 0,
};

describe('UrlsService', () => {
  let service: UrlsService;
  let model: Model<Url>;
  let configService: ConfigService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getModelToken(Url.name),
          useValue: {
            data: null,
            findOne: jest.fn().mockReturnThis(),
            findOneAndUpdate: jest.fn().mockReturnThis(),
            updateOne: jest.fn().mockImplementation(async function () {
              return this;
            }),
            create: jest.fn().mockResolvedValue(urlMapping as any),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockImplementation(async function () {
              const data = this.data;
              this.data = null;

              return data;
            }),
          },
        },
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    model = module.get<Model<Url>>(getModelToken(Url.name));
    configService = module.get<ConfigService>(ConfigService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shortenUrl()', () => {
    it('creates and stores new url-to-code mapping and returns shortened url', async () => {
      const result = await service.shortenUrl(urlMapping.url);

      expect(model.findOne).toHaveBeenCalledWith({ url: urlMapping.url });
      expect(model.create).toHaveBeenCalledWith({
        url: urlMapping.url,
        clickCount: urlMapping.clickCount,
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `code:${urlMapping.code}`,
        urlMapping.url,
      );

      expect(result).toBe(
        `${configService.get<string>('SERVER_URL')}/${urlMapping.code}`,
      );
    });

    it('returns existing url-to-code mapping, if found', async () => {
      jest.spyOn(model, 'findOne').mockImplementationOnce(function () {
        this.data = {
          code: urlMapping.code,
        };

        return this;
      });

      const result = await service.shortenUrl(urlMapping.url);

      expect(model.findOne).toHaveBeenCalledWith({ url: urlMapping.url });
      expect(model.create).not.toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        `code:${urlMapping.code}`,
        urlMapping.url,
      );

      expect(result).toBe(
        `${configService.get<string>('SERVER_URL')}/${urlMapping.code}`,
      );
    });
  });

  describe('getUrlByCode()', () => {
    it('returns url from cache', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(urlMapping.url);

      const result = await service.getUrlByCode(urlMapping.code);

      expect(cacheManager.get).toHaveBeenCalledWith(`code:${urlMapping.code}`);
      expect(model.updateOne).toHaveBeenCalledWith(
        { code: urlMapping.code },
        { $inc: { clickCount: 1 } },
      );
      expect(model.findOneAndUpdate).not.toHaveBeenCalled();

      expect(result).toBe(urlMapping.url);
    });

    it('returns url from database', async () => {
      jest.spyOn(model, 'findOneAndUpdate').mockImplementationOnce(function () {
        this.data = {
          url: urlMapping.url,
        };

        return this;
      });

      const result = await service.getUrlByCode(urlMapping.code);

      expect(cacheManager.get).toHaveBeenCalledWith(`code:${urlMapping.code}`);
      expect(model.updateOne).not.toHaveBeenCalled();
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { code: urlMapping.code },
        { $inc: { clickCount: 1 } },
      );

      expect(result).toBe(urlMapping.url);
    });

    it('returns undefined, if no url found', async () => {
      const result = await service.getUrlByCode(urlMapping.code);

      expect(cacheManager.get).toHaveBeenCalledWith(`code:${urlMapping.code}`);
      expect(model.updateOne).not.toHaveBeenCalled();
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { code: urlMapping.code },
        { $inc: { clickCount: 1 } },
      );

      expect(result).toBeUndefined();
    });
  });
});
