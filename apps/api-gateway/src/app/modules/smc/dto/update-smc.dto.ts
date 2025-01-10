import { PartialType } from '@nestjs/mapped-types';
import { CreateSmcDto } from './create-smc.dto';

export class UpdateSmcDto extends PartialType(CreateSmcDto) {}
