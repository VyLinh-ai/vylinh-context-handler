import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/api-key.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { NFTAssetService } from './nft-asset.service';
import { CreateNFTAssetDto } from './dto/create-nft-asset.dto';
import { UpdateNFTAssetDto } from './dto/update-nft-asset.dto';
import { NFTAssetFilterDto } from './dto/query-nft-asset.dto';

@Controller('asset-nft')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NFTAssetController {
  constructor(private readonly nftAssetService: NFTAssetService) {}

  @Post('create')
  // @Roles('MASTER', 'GD')
  async createNFTAsset(@Body() createNFTAssetDto: CreateNFTAssetDto) {
    return this.nftAssetService.createNFTAsset(createNFTAssetDto);
  }

  @Put('update/:id')
  // @Roles('MASTER', 'GD')
  async updateNFTAsset(
    @Param('id') id: string,
    @Body() updateNFTAssetDto: UpdateNFTAssetDto,
  ) {
    return this.nftAssetService.updateNFTAsset(id, updateNFTAssetDto);
  }

  @Delete('remove/:id')
  // @Roles('MASTER')
  async removeNFTAsset(@Param('id') id: string) {
    return this.nftAssetService.removeNFTAsset(id);
  }

  @Get()
  async getNFTAssets(@Query() filter: NFTAssetFilterDto) {
    return this.nftAssetService.getNFTAssets(filter);
  }

  // Endpoint to get details of a single NFT asset by ID
  @Get(':id')
  async getNFTAssetById(@Param('id') id: string) {
    return this.nftAssetService.getNFTAssetById(id);
  }
}
