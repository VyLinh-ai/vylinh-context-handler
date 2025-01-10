import { Injectable } from '@nestjs/common';
import { QueueService } from './queue.service';
import { MempoolTxDto } from '@layerg-agg-workspace/shared/dto';
import { AppService } from './app.service';

@Injectable()
export class TransactionQueueServiceDemo extends QueueService<MempoolTxDto> {
  constructor(private readonly transactionService: AppService) {
    super(async (task: MempoolTxDto) => {
      await transactionService.handleTx(task);
    });
  }
}
