// transaction-event.dto.ts
import {
  IsString,
  IsNumber,
  ValidateNested,
  IsOptional,
} from 'class-validator';

class TransactionOptionsDto {
  @IsNumber()
  readonly value?: number;

  @IsNumber()
  readonly gasLimit?: number;

  @IsNumber()
  readonly gasPrice?: number;
}
export class TransactionEventDto {
  @IsString()
  @IsOptional()
  readonly sender?: string;

  @IsString()
  readonly contractAddress: string;

  readonly abi: any[];

  @IsString()
  readonly methodName: string;

  readonly methodParams: any[];

  @IsOptional()
  readonly identifier?: string;

  @ValidateNested()
  readonly transactionOptions: TransactionOptionsDto;
}
