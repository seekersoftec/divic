import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(configService: ConfigService) {
  const logger = new Logger('Response');
  const app = await NestFactory.create(AppModule);

  // const swaggerConfig = new DocumentBuilder()
  //   .setTitle('Backend')
  //   .setDescription('The Backend API description')
  //   .setVersion('0.1')
  //   .build();
  // const document = SwaggerModule.createDocument(app, swaggerConfig);
  // SwaggerModule.setup('api', app, document);

  app.enableCors();
  // app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get('PORT');

  await app.listen(process.env.PORT);

  logger.log(`Application listening on port ${port}`);
}

bootstrap(new ConfigService());
