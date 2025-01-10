/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST as string,
        port: process.env.REDIS_PORT as unknown as number,
        username: process.env.REDIS_USERNAME as string,
        password: process.env.REDIS_PASSWORD as string,
      },
    },
  );
  await app.listen();
}

bootstrap();
