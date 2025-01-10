import { Controller } from '@nestjs/common';

import { AppService } from './app.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { LockService } from './lock.service';
import { LockNFTBalanceDto } from './dto/lock-request.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { MempoolTxDto } from '@layerg-agg-workspace/shared/dto';
import { TransactionQueueProcessor } from './tx-verifier-queue';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    readonly lockService: LockService,
    readonly txService: TransactionQueueProcessor,
  ) {}

  @MessagePattern('tx_queue')
  async handleTx(data: MempoolTxDto) {
    try {
      await this.appService.handleTx(data);
      return {
        status: 'Success',
        message: 'Success',
      };
    } catch (err) {
      console.log(err);
      return {
        status: 'Failed',
        message: err.message,
      };
    }
  }

  @MessagePattern('lock')
  async handleLock(data: LockNFTBalanceDto) {
    try {
      await this.lockService.lockNFTBalance(
        data.userAddress,
        data.nftAssetId,
        new Decimal(data.amountToLock),
      );
      return {
        status: 'Success',
        message: 'Success',
      };
    } catch (e) {
      return {
        status: 'Failed',
        message: e.message,
      };
    }
  }
  @EventPattern('verify')
  async handleVerification(data: { txHash: string }) {
    await this.txService.addVerificationJob(data.txHash);
  }
}
