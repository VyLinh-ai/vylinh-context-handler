import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveNFTAssetDto {
  @IsString()
  @IsNotEmpty()
  id: string; // NFTAsset ID
}
