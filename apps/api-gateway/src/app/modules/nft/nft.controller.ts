import { Controller, Get, Query } from '@nestjs/common';
import { NftService } from './nft.service';
import {
  NFTBalanceFilterDto,
  NFTBalanceResponse,
} from './dto/get-nft-balance.dto';
import { GetNFTAssetsDto, NFTAssetResponse } from './dto/get-nft-assets.dto';

@Controller('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get('assets')
  async getNFTAssets(
    @Query() filter: GetNFTAssetsDto,
  ): Promise<PagingResponseHasNext<NFTAssetResponse>> {
    return this.nftService.getNFTAssets(filter);
  }
  @Get()
  async getNFTBalances(
    @Query() filter: NFTBalanceFilterDto,
  ): Promise<PagingResponseHasNext<NFTBalanceResponse>> {
    return this.nftService.getNFTBalances(filter);
  }
}
