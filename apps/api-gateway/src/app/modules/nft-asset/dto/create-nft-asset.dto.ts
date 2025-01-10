import { IsString, IsNotEmpty, IsOptional, IsDecimal } from 'class-validator';

export class CreateNFTAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDecimal()
  @IsNotEmpty()
  tokenId: string; // Assume it's a string-encoded large number

  @IsString()
  @IsNotEmpty()
  collectionId: string;

  @IsOptional()
  @IsDecimal()
  quantity?: string; // Optional quantity field with default of 1

  @IsOptional()
  media?: {
    S3Url: string;
    // IPFSUrl: string;
  };

  @IsOptional()
  metadata?: {
    metadata: any;
    // IPFSUrl?: string;
  };
}
