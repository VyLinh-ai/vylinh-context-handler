import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNFTAssetDto } from './dto/create-nft-asset.dto';
import { UpdateNFTAssetDto } from './dto/update-nft-asset.dto';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import OtherError from '../../commons/errors/OtherError.error';
import { EErrorCode } from '../../commons/enums/Error.enum';
import { NFTAssetFilterDto } from './dto/query-nft-asset.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NFTAssetService {
  constructor(private readonly prisma: PrismaService) {}

  async createNFTAsset(createNFTAssetDto: CreateNFTAssetDto) {
    const {
      name,
      description,
      tokenId,
      collectionId,
      media,
      metadata,
      quantity,
    } = createNFTAssetDto;

    // Check if the collection exists
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const existingAssetCollection = await this.prisma.nFTAsset.findUnique({
      where: {
        tokenId_collectionId: {
          tokenId,
          collectionId,
        },
      },
    });
    if (existingAssetCollection) {
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.OTHER_ERROR,
          message: 'TokenID is created in this colllection',
        },
      });
    }

    const nftAsset = await this.prisma.nFTAsset.create({
      data: {
        name,
        description,
        tokenId,
        collectionId,
        quantity,
        media: media ? { create: media } : undefined,
        metadata: metadata ? { create: metadata } : undefined,
      },
    });

    return nftAsset;
  }

  // Update NFT Asset
  async updateNFTAsset(id: string, updateNFTAssetDto: UpdateNFTAssetDto) {
    // Check if the NFT asset exists
    const nftAsset = await this.prisma.nFTAsset.findUnique({
      where: { id },
    });

    if (!nftAsset) {
      throw new NotFoundException('NFT Asset not found');
    }

    // Update the NFT asset
    const updatedNFTAsset = await this.prisma.nFTAsset.update({
      where: { id },
      data: {
        ...updateNFTAssetDto,
        media: updateNFTAssetDto.media
          ? { update: updateNFTAssetDto.media }
          : undefined,
        metadata: updateNFTAssetDto.metadata
          ? { update: updateNFTAssetDto.metadata }
          : undefined,
      },
    });

    return updatedNFTAsset;
  }

  // Remove NFT Asset
  async removeNFTAsset(id: string) {
    // Check if the NFT asset exists
    const nftAsset = await this.prisma.nFTAsset.findUnique({
      where: { id },
    });

    if (!nftAsset) {
      throw new NotFoundException('NFT Asset not found');
    }

    // Delete the NFT asset
    await this.prisma.nFTAsset.delete({
      where: { id },
    });

    return { message: 'NFT Asset removed successfully' };
  }

  async getNFTAssets(filter: NFTAssetFilterDto): Promise<
    PagingResponse<
      Prisma.NFTAssetGetPayload<{
        include: { media: true; metadata: true; collection: true };
      }>
    >
  > {
    const { collectionId, page, limit } = filter;

    // Calculate pagination parameters
    const skip = (page - 1) * limit;
    const take = limit;

    const nftAssets = await this.prisma.nFTAsset.findMany({
      where: {
        collectionId,
      },
      include: {
        collection: true,
        media: true,
        metadata: true,
      },
      skip,
      take,
    });

    // Optional: Get the total count for pagination metadata
    const totalCount = await this.prisma.nFTAsset.count({
      where: {
        collectionId,
      },
    });

    return {
      data: nftAssets,
      paging: {
        total: totalCount,
        page,
        limit,
      },
    };
  }

  // Method to get details of a specific NFT asset by ID
  async getNFTAssetById(id: string) {
    const nftAsset = await this.prisma.nFTAsset.findUnique({
      where: { id },
      include: {
        collection: true,
        media: true,
        metadata: true,
      },
    });

    if (!nftAsset) {
      throw new NotFoundException(`NFT Asset with ID ${id} not found`);
    }

    return nftAsset;
  }
}
