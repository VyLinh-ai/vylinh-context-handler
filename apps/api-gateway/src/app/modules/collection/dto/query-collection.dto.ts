import { OffsetPaginationDto } from '../../../commons/definitions/OffsetPagination.input';

export class CollectionFilterDto extends OffsetPaginationDto {
  projectId: string;
}
