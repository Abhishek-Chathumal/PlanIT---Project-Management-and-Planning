import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { ProjectsModule } from './projects.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ProjectsModule, {
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URL || 'nats://localhost:4222'],
    },
  });

  await app.listen();
  console.log('📁 Projects Microservice is listening on NATS');
}

bootstrap();
