import { Module } from '@nestjs/common';
import { NFTAssetService } from './nft-asset.service';
import { NFTAssetController } from './nft-asset.controller';
import { PrismaService } from '@layerg-agg-workspace/shared/services';

@Module({
  controllers: [NFTAssetController],
  providers: [NFTAssetService, PrismaService],
})
export class NftAssetModule {}
