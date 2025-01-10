export class LockNFTBalanceDto {
  userAddress: string;

  nftAssetId: string;

  amountToLock: string; // The amount to lock, must be greater than 0
}
