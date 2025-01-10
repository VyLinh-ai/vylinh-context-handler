import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { ApiKeyJwtStrategy } from './strategies/apikey.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: async () => ({
        signOptions: {
          expiresIn: '7d',
        },
        secret: process.env.JWT_SECRET,
      }),
    }),
    ConfigModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, ApiKeyJwtStrategy],
})
export class AuthModule {}
