import { NFTBalance } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

enum NftStatus {
  ONCHAIN,
  OFFCHAIN,
}
export class Nft implements NFTBalance {
  burnAmount: Decimal;
  lockAmount: Decimal;
  version: string;
  id: string;
  userId: string;
  nftAssetId: string;
  amount: Decimal;
  createdAt: Date;
  updatedAt: Date;
  status: NftStatus;
}
