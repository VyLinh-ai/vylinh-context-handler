import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class OffsetPaginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  @ApiProperty({
    example: 10,
    description: 'Limit number',
    required: false,
  })
  limit?: number = 10;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @ApiProperty({
    example: 'asc',
    description: 'Order (if available)',
    required: false,
  })
  order?: 'asc' | 'desc' = 'desc';

  // Add any other common pagination-related properties or methods here.
}
