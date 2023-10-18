import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SocketIOAdapter } from './socket.io.adapter';

async function bootstrap() {
  const logger = new Logger('Main (main.ts)');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = parseInt(configService.get('PORT'));
  const clientPort = parseInt(configService.get('CLIENT_PORT'));
  app.enableCors({
    origin: [
      `http://54.144.198.82:${clientPort}`,
      `ws://54.144.198.82:${clientPort}`
    ],
  });
  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));

  await app.listen(port);

  logger.log(`Server running on port ${port}`);
}
bootstrap();