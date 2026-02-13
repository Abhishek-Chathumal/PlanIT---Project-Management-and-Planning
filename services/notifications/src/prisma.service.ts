import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: { query: string }) => {
        console.log('Query:', e.query);
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
