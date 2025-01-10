import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '0x2743eEC46576f76f47334569074242F3D9a90B44',
    description: 'The publickey of the user',
  })
  @IsString({ message: 'public key must be a string ' })
  @MinLength(5)
  @MaxLength(100)
  publicKey: string;

  @ApiProperty({
    example:
      '0x5571a359fb0338ef9e6b0cb125c3f9e2ac84c9f68aadfc8414bd89724a125b92142d3717cbe0cf7bf3a30d20c64221cb18d3bdad3a2bd1836f0634abd4331bbd1c',
    description: 'The signature of the user',
  })
  @IsString({ message: 'signature must be a string ' })
  @MinLength(5)
  @MaxLength(500)
  signature: string;

  @ApiProperty({
    example: '0x2743eec46576f76f47334569074242f3d9a90b44',
    description: 'The un-capitalized address',
  })
  @IsString({ message: 'signer must be a string ' })
  @MinLength(5)
  @MaxLength(100)
  signer: string;

  @ApiProperty({
    example: '2024-03-06T18:48:41.610Z',
    description: 'The login date of user',
  })
  @IsNotEmpty({ message: 'date is not empty' })
  @MinLength(5)
  @MaxLength(100)
  date: string;
}
