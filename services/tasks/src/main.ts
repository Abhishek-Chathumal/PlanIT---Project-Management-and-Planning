import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { TasksModule } from './tasks.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TasksModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
    },
  });

  await app.listen();
  console.log('✅ Tasks Microservice is listening on NATS');
}

bootstrap();
