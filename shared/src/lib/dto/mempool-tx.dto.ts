import { IsNotEmpty, IsString } from 'class-validator';
import { IsEvmAddress } from '../validators';

export enum TransactionType {
  MINT_NFT = 'MINT_NFT',
  TRANSFER_NFT = 'TRANSFER_NFT',
}

export class MempoolTxDto {
  // hash: string;
  // signature: string;
  // signerAddress: string;
  @IsNotEmpty()
  txType: TransactionType;

  rawData: MintNftOffchainRawdata | TransferNftOffchainRawData;
}

export class MintNftOffchainRawdata {
  from: string;
  @IsEvmAddress({ message: 'Please provide a valid Ethereum address' })
  @IsNotEmpty()
  recipient: string;
  @IsString()
  @IsNotEmpty()
  nftId: string;
  @IsString()
  @IsNotEmpty()
  amount = '1';
  // @IsString()
  // @IsNotEmpty()
  // UAToken: string;
}

export class MintNftOffchainDto extends MintNftOffchainRawdata {
  //   // signature: string;
  //   @IsString()
  //   @IsNotEmpty()
  //   signerAddress: string;
}

export class TransferNftOffchainRawData {
  @IsEvmAddress({ message: 'Please provide a valid Ethereum address' })
  @IsNotEmpty()
  from: string;
  @IsEvmAddress({ message: 'Please provide a valid Ethereum address' })
  @IsNotEmpty()
  to: string;

  @IsNotEmpty()
  @IsString()
  nftId: string;

  @IsNotEmpty()
  @IsString()
  amount: number;

  // @IsString()
  // @IsNotEmpty()
  // UAToken: string;
}

export class TransferNftOffchainDto extends TransferNftOffchainRawData {
  //   signature: string;
  //   signerAddress: string;
}

export class TXResponse {
  status: string;
  message: string;
}

export class LockNFTBalanceDto {
  userAddress: string;

  nftAssetId: string;

  amountToLock: string; // The amount to lock, must be greater than 0
}
