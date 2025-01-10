import { IsOptional, IsString, IsDecimal } from 'class-validator';

export class UpdateNFTAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDecimal()
  tokenId?: string;

  @IsOptional()
  @IsDecimal()
  quantity?: string;

  @IsOptional()
  media?: {
    S3Url?: string;
    IPFSUrl?: string;
  };

  @IsOptional()
  metadata?: {
    metadata?: any;
    IPFSUrl?: string;
  };
}
