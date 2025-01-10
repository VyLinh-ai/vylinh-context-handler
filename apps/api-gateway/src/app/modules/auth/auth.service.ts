import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { KEY_ROLE } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async createApiKey(masterApiKey: string) {
    const masterKeyData = await this.prisma.aPIKey.findUnique({
      where: { apiKey: masterApiKey },
    });

    if (
      !masterKeyData ||
      masterKeyData.isBlackListed ||
      masterKeyData.roles !== 'MASTER'
    ) {
      throw new UnauthorizedException(
        'Only MASTER API keys can create new API keys',
      );
    }

    const rawApiKey = this.generateRawApiKey();
    const hashedApiKey = await bcrypt.hash(rawApiKey, 10);

    const apiKey = await this.prisma.aPIKey.create({
      data: {
        apiKey: hashedApiKey,
        isBlackListed: false,
        roles: KEY_ROLE.GD,
      },
    });

    // Step 4: Return the new raw API key (only shown once to the user)
    return { rawApiKey, apiKeyID: apiKey.id };
  }

  // Utility function to generate a random API key string
  private generateRawApiKey(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
