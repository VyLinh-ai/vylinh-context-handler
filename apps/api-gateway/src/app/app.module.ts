import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BigIntInterceptor } from './commons/interceptors/bigint.interceptor';
import { TransactionModule } from './modules/transaction/transaction.module';
import { ProjectModule } from './modules/project/project.module';
import { AuthModule } from './modules/auth/auth.module';
import { CollectionModule } from './modules/collection/collection.module';
import { CommonModule } from './modules/common/common.module';
import { NftAssetModule } from './modules/nft-asset/nft-asset.module';
import { NftModule } from './modules/nft/nft.module';
import { SmcModule } from './modules/smc/smc.module';

@Module({
  imports: [
    TransactionModule,
    ProjectModule,
    AuthModule,
    CollectionModule,
    CommonModule,
    NftAssetModule,
    NftModule,
    SmcModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: BigIntInterceptor,
    },
  ],
})
export class AppModule {}
