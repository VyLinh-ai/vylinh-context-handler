import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  description: string;

  @IsString()
  avatarUrl: string;

  @IsString()
  projectID: string;
}
