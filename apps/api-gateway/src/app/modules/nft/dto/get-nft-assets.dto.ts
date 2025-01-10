import { OffsetPaginationDto } from '../../../commons/definitions/OffsetPagination.input';
import { MediaStorage, Metadata } from '@prisma/client';

export class GetNFTAssetsDto extends OffsetPaginationDto {
  created_at: Date;
}

export interface NFTAssetResponse {
  id: string;
  name: string;
  tokenId: string;
  description: string;
  collectionAddress: string;
  type: 'ERC721' | 'ERC1155';
  media: MediaStorage | null;
  metadata: Metadata | null;
  balance: string;
  ownerAddress: string;
}
