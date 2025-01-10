// src/services/nft-balance.service.ts

import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { Injectable, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { AppService } from './app.service';

@Injectable()
export class LockService {
  constructor(
    private prisma: PrismaService,
    private readonly mainService: AppService,
  ) {}

  // Lock a specific amount of an NFT balance for a given user and asset
  async lockNFTBalance(
    userAddress: string,
    nftAssetId: string,
    amountToLock: Decimal,
  ): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      const user = await this.mainService.getUserByAddress(userAddress);
      const nftBalance = await prisma.nFTBalance.findUnique({
        where: {
          userId_nftAssetId: { userId: user.id, nftAssetId },
        },
        select: { amount: true, lockAmount: true, version: true },
      });

      if (!nftBalance) {
        throw new BadRequestException(
          `NFT balance for user ${user.id} and asset ${nftAssetId} not found.`,
        );
      }

      // Step 2: Check if sufficient balance is available
      if (nftBalance.amount.lessThan(amountToLock)) {
        throw new BadRequestException(
          `Insufficient balance to lock ${amountToLock} units.`,
        );
      }

      // Step 3: Update balance atomically to lock the amount
      await prisma.nFTBalance.update({
        where: {
          userId_nftAssetId_version: {
            userId: user.id,
            nftAssetId,
            version: nftBalance.version,
          },
        },
        data: {
          amount: nftBalance.amount.minus(amountToLock), // Subtract from available amount
          lockAmount: nftBalance.lockAmount.plus(amountToLock), // Add to lock amount
        },
      });
    });
  }

  // Unlock a specific amount of an NFT balance for a given user and asset
  async unlockNFTBalance(
    userId: string,
    nftAssetId: string,
    amountToUnlock: Decimal,
  ): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      const nftBalance = await prisma.nFTBalance.findUnique({
        where: {
          userId_nftAssetId: { userId, nftAssetId },
        },
        select: { amount: true, lockAmount: true, version: true },
      });

      if (!nftBalance) {
        throw new BadRequestException(
          `NFT balance for user ${userId} and asset ${nftAssetId} not found.`,
        );
      }

      if (nftBalance.lockAmount.lessThan(amountToUnlock)) {
        throw new BadRequestException(
          `Insufficient locked balance to unlock ${amountToUnlock} units.`,
        );
      }

      await prisma.nFTBalance.update({
        where: {
          userId_nftAssetId: {
            userId,
            nftAssetId,
            version: nftBalance.version,
          },
        },
        data: {
          lockAmount: nftBalance.lockAmount.minus(amountToUnlock),
        },
      });
    });
  }
}
