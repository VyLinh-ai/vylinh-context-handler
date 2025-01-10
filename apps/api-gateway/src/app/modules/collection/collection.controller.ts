import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { JwtAuthGuard } from '../auth/guards/api-key.guard';
import { CurrentAPIKey } from '../../commons/decorators/CurrentAPIKey.decorator';
import { APIKey } from '@prisma/client';
import { CollectionFilterDto } from './dto/query-collection.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createCollectionDto: CreateCollectionDto,
    @CurrentAPIKey() key: APIKey,
  ) {
    return this.collectionService.create(createCollectionDto, key);
  }

  @Get()
  async getCollections(@Query() filter: CollectionFilterDto) {
    return this.collectionService.getCollections(filter);
  }

  @Get(':id')
  async getCollectionById(@Param('id') id: string) {
    return this.collectionService.getCollectionById(id);
  }
}
