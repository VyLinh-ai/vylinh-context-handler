// src/services/transaction-queue.processor.ts

import { Processor, Process } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bull';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '@layerg-agg-workspace/shared/services';

interface TransactionData {
  id: string;
  from: string;
  to: string;
  assetId: string;
  tokenId: string;
  amount: number;
  txHash: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionHistoryResponse {
  message: string;
  data: TransactionData[];
}

@Processor('transactionVerification')
export class TransactionQueueProcessor {
  private readonly maxRequeueAttempts = 5; // Max times to requeue a task if still pending
  private readonly requeueDelay = 10000; // Delay in ms between rechecks (10 seconds)

  constructor(
    private readonly httpService: HttpService,
    @InjectQueue('transactionVerification') private readonly queue: Queue,
    readonly prisma: PrismaService,
  ) {}

  async addVerificationJob(txHash: string) {
    const isConfirmedTX = await this.prisma.confirmedTX.findUnique({
      where: {
        id: txHash,
      },
    });
    if (!isConfirmedTX) {
      await this.queue.add('verifyTransaction', { txHash, requeueCount: 0 });
    }
    console.log(`TX Hash already been confirmed`);
  }
  @Process('verifyTransaction')
  async handleVerificationJob(
    job: Job<{ txHash: string; requeueCount: number }>,
  ) {
    const { txHash, requeueCount = 0 } = job.data;

    try {
      const response = await lastValueFrom(
        this.httpService.get<TransactionHistoryResponse>(
          `${process.env.CRAWLER_URL}/history?tx_hash=${txHash}`,
          {
            headers: {
              'X-API-KEY': process.env.CRAWLER_KET,
            },
          },
        ),
      );

      if (response.data.message === 'success' && response.data.data !== null) {
        console.log(`Transaction ${txHash} verified as successful.`);
        for (const transaction of response.data.data) {
          const { amount, to: toAddress, assetId, tokenId } = transaction;

          const collectionAddress = assetId.split(':')[1];

          const nftBalance = await this.prisma.nFTBalance.findFirst({
            where: {
              user: { address: toAddress },
              nftAsset: {
                collection: {
                  SmartContract: {
                    some: { contractAddress: collectionAddress },
                  },
                },
                tokenId,
              },
            },
          });

          // Check if the record exists and if lockAmount is sufficient to burn
          if (nftBalance && nftBalance.lockAmount.gte(amount)) {
            await this.prisma.nFTBalance.update({
              where: { id: nftBalance.id, version: nftBalance.version },
              data: {
                lockAmount: nftBalance.lockAmount.minus(
                  amount === 0 ? 1 : amount,
                ),
                burnAmount: nftBalance.burnAmount.plus(
                  amount === 0 ? 1 : amount,
                ),
              },
            });
            console.log(
              `Updated lockAmount for NFTBalance ID ${nftBalance.id} after transfer of ${amount}.`,
            );
            await this.prisma.confirmedTX.create({
              data: {
                id: txHash,
                networkID: 2484,
              },
            });
          } else {
            console.error(
              `Failed to update lockAmount for transfer to ${toAddress}: Insufficient locked balance.`,
            );
            return {
              status: 'failed',
              txHash,
              message: `Insufficient locked balance for transfer to ${toAddress}`,
            };
          }
        }

        return { status: 'success' };
      } else {
        console.log(`Transaction ${txHash} is still pending.`);

        // Check if requeue limit reached
        if (requeueCount >= this.maxRequeueAttempts) {
          console.log(
            `Transaction ${txHash} verification failed after maximum requeues.`,
          );
          return { status: 'failed' };
        }

        // Re-enqueue with incremented requeue count
        await this.queue.add(
          'verifyTransaction',
          { txHash, requeueCount: requeueCount + 1 },
          { delay: this.requeueDelay },
        );

        return { status: 'pending', requeueCount: requeueCount + 1 };
      }
    } catch (error) {
      console.error(`Error checking transaction ${txHash}:`, error.message);
      // Optionally re-enqueue on error if within requeue limit
      if (requeueCount < this.maxRequeueAttempts) {
        await this.queue.add(
          'verifyTransaction',
          { txHash, requeueCount: requeueCount + 1 },
          { delay: this.requeueDelay },
        );
      }
      return { status: 'failed', error: error.message };
    }
  }
}
