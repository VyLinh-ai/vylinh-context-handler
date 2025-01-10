import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { PrismaService } from '@layerg-agg-workspace/shared/services';

@Module({
  controllers: [CollectionController],
  providers: [CollectionService, PrismaService],
})
export class CollectionModule {}
