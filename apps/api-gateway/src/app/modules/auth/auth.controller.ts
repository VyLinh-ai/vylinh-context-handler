import { PrismaService } from '@layerg-agg-workspace/shared/services';
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './guards/api-key.guard';
import { RolesGuard } from './guards/role.guard';
import { Roles } from '../../commons/decorators/roles.decorator';
import { CurrentAPIKey } from '../../commons/decorators/CurrentAPIKey.decorator';
import { APIKey } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const apiKeyData = await this.prisma.aPIKey.findUnique({
        where: { apiKey: payload.apiKey },
      });

      if (!apiKeyData || apiKeyData.isBlackListed) {
        throw new UnauthorizedException('Invalid or blacklisted API key');
      }

      const newAccessToken = this.jwtService.sign({
        apiKey: apiKeyData.apiKey,
      });
      return { accessToken: newAccessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('login')
  async login(@Body('apiKey') apiKey: string, @Body('apiKeyID') id: string) {
    const apiKeyData = await this.prisma.aPIKey.findUnique({
      where: { id },
    });

    if (!apiKeyData) {
      throw new UnauthorizedException('Invalid or blacklisted API key');
    }

    const isMatch = await bcrypt.compare(apiKey, apiKeyData.apiKey);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid API key');
    }

    const payload = apiKeyData;
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MASTER')
  async createApiKey(@CurrentAPIKey() key: APIKey) {
    const { rawApiKey, apiKeyID } = await this.authService.createApiKey(
      key.apiKey,
    );

    return { rawApiKey, apiKeyID };
  }
}
