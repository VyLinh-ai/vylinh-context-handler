import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import * as bcrypt from 'bcrypt';
import { APIKey } from '@prisma/client';

@Injectable()
export class ApiKeyJwtStrategy extends PassportStrategy(Strategy, 'apikey') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: APIKey) {
    const apiKey = await this.prisma.aPIKey.findUnique({
      where: { id: payload.id },
    });

    if (!apiKey || apiKey.isBlackListed) {
      throw new UnauthorizedException('Invalid or blacklisted API key');
    }

    return apiKey;
  }
}
