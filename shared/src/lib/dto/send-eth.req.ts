// transaction-event.dto.ts
import { IsString } from 'class-validator';

export class SendEthDto {
  @IsString()
  readonly value: string;

  @IsString()
  readonly to: string;
}
