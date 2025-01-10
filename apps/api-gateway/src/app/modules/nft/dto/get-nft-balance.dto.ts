import { MediaStorage, Metadata } from '@prisma/client';
import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OffsetPaginationDto } from '../../../commons/definitions/OffsetPagination.input';

export enum NFTBalanceMode {
  OFFCHAIN = 'offchain',
  ONCHAIN = 'onchain',
}
export class NFTBalanceFilterDto extends OffsetPaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  tokenIds?: string[];

  @IsOptional()
  @IsString()
  ownerAddress?: string;

  @IsString()
  collectionAddress: string;

  @IsOptional()
  @IsEnum(NFTBalanceMode)
  mode?: NFTBalanceMode = NFTBalanceMode.OFFCHAIN;

  @IsOptional()
  contractID?: string;

  @IsOptional()
  projectID?: string;
}

export interface NFTBalanceResponse {
  id: string;
  name: string;
  tokenId: string;
  description: string;
  collectionAddress: string;
  type: 'ERC721' | 'ERC1155';
  media: MediaStorage | null;
  metadata: Metadata | null;
  offChainBalance: string;
  onChainBalance: string;
  ownerAddress: string;
}
