import { IsOptional, IsEnum } from 'class-validator';
import { OffsetPaginationDto } from '../../../commons/definitions/OffsetPagination.input';
import { ContractType } from '@prisma/client';
import { Type } from 'class-transformer';

export class SmartContractFilterDto extends OffsetPaginationDto {
  @Type(() => Number)
  networkID: number;

  @IsEnum(ContractType)
  @IsOptional()
  contractType?: ContractType;

  @IsOptional()
  contractName?: string;

  @IsOptional()
  contractAddress?: string;

  @IsOptional()
  projectId?: string;
}
