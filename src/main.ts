import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Record<string, unknown>, true>);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sinova URL Shortener API')
    .setDescription('URL Shortener API test task for Sinova vacancy')
    .setVersion('0.0.1')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
