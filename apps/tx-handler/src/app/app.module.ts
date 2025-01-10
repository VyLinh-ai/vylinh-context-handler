import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { CommonService } from './common.service';
import { ConversionHelperService } from './conversion-helper.service';
import { LockService } from './lock.service';
import { QueueService } from './queue.service';
import { TransactionQueueProcessor } from './tx-verifier-queue';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'transactionVerification',
    }),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    CommonService,
    ConversionHelperService,
    LockService,
    TransactionQueueProcessor,
  ],
})
export class AppModule {}
