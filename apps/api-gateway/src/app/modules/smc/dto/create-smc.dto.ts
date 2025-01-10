import { ContractType } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateSmcDto {
  @IsString()
  contractName: string;
  @IsString()
  tokenSymbol: string;
  @IsString()
  contractType: ContractType;
  @IsString()
  chainID: number;
}
