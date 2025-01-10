import {
  Injectable,
  OnModuleInit,
  INestApplication,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      this.logger.log(
        `Query ${params.model}.${params.action} took ${after - before}ms`,
      );
      return result;
    });
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {}

  async onApplicationShutdown(signal?: string) {
    await this.$disconnect();
  }
}
