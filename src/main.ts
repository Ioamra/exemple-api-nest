import compression from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import helmet from '@fastify/helmet';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { ExceptionInterceptor } from './common/interceptor/interceptor';
import { CustomLoggerService } from './common/services/customLogger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);
  const configService = app.get(ConfigService);

  await app.register(fastifyCookie, {
    secret: configService.get('cookie.secret'),
  });

  await app.register(helmet);
  await app.register(fastifyCsrfProtection);
  await app.register(compression, { encodings: ['gzip'], global: true });
  app.useGlobalInterceptors(new ExceptionInterceptor());

  const port = configService.get('port');

  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: true,
  });

  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port} !`, 'Bootstrap');
}
bootstrap();
