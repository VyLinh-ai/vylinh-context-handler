import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIweDI3NDNlZWM0NjU3NmY3NmY0NzMzNDU2OTA3NDI0MmYzZDlhOTBiNDQiLCJpYXQiOjE3MTAwODg4NTMsImV4cCI6MTcxMDE3NTI1M30.tGcLicAZDI6QheQvIgIM7N9TJbjNLgwdflElIv296SI',
    description: 'The refresh token of the account',
  })
  refreshToken: string;
  @ApiProperty({
    example: 1710175253716,
    description: 'The expiration of refresh token',
  })
  refreshTokenExpire: number;
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIweDI3NDNlZWM0NjU3NmY3NmY0NzMzNDU2OTA3NDI0MmYzZDlhOTBiNDQiLCJpYXQiOjE3MTAwODg4NTMsImV4cCI6MTcxMDE3NTI1M30.tGcLicAZDI6QheQvIgIM7N9TJbjNLgwdflElIv296SI',
    description: 'The access token of the account',
  })
  accessToken: string;
  @ApiProperty({
    example: 1710175253716,
    description: 'The expiration of access token',
  })
  accessTokenExpire: number;
  @ApiProperty({
    example: '0x2743eec46576f76f47334569074242f3d9a90b44',
    description: 'The address of account',
  })
  userId: string;
}
