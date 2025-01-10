import { OffsetPaginationDto } from '../../../commons/definitions/OffsetPagination.input';

export class NFTAssetFilterDto extends OffsetPaginationDto {
  collectionId: string;
}
