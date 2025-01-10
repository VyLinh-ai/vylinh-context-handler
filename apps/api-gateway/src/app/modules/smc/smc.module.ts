import { Module } from '@nestjs/common';
import { SmartContractService } from './smc.service';
import { SmcController } from './smc.controller';
import { PrismaService } from '@layerg-agg-workspace/shared/services';

@Module({
  controllers: [SmcController],
  providers: [SmartContractService, PrismaService],
})
export class SmcModule {}
