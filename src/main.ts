import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap(configService: ConfigService) {
  const logger = new Logger('Response');
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  // app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get('PORT');

  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
}

bootstrap(new ConfigService());
