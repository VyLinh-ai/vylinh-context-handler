import { Module } from '@nestjs/common';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { HttpModule } from '@nestjs/axios';
import { CollectionService } from '../collection/collection.service';

@Module({
  imports: [HttpModule],
  controllers: [NftController],
  providers: [NftService, PrismaService, CollectionService],
})
export class NftModule {}
