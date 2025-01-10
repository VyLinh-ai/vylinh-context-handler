import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PLATFORM } from '@prisma/client';
import { OffsetPaginationDto } from '../../../commons/definitions/OffsetPagination.input';

export class ProjectFilterDto extends OffsetPaginationDto {
  @IsOptional()
  @IsArray()
  platform?: PLATFORM[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}
