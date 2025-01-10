import { Injectable } from '@nestjs/common';
import {
  NFTBalanceFilterDto,
  NFTBalanceMode,
  NFTBalanceResponse,
} from './dto/get-nft-balance.dto';
import { GetNFTAssetsDto, NFTAssetResponse } from './dto/get-nft-assets.dto';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Prisma } from '@prisma/client';
import OtherCommon from '../../commons/Other.common';
import OtherError from '../../commons/errors/OtherError.error';
import { EErrorCode } from '../../commons/enums/Error.enum';
import { CollectionService } from '../collection/collection.service';
import { NFTCrawlerRep } from '../../commons/definitions/response-definitions/nft.type';

@Injectable()
export class NftService {
  constructor(
    readonly prisma: PrismaService,
    readonly httpService: HttpService,
    readonly collectionService: CollectionService,
  ) {}

  async getNFTBalances(
    filter: NFTBalanceFilterDto,
  ): Promise<PagingResponseHasNext<NFTBalanceResponse>> {
    const {
      name,
      tokenIds,
      ownerAddress,
      collectionAddress,
      contractID,
      projectID,
      mode,
      page,
      limit,
    } = filter;

    const skip = (page - 1) * limit;
    const take = limit + 1;

    let combinedData: NFTBalanceResponse[] = [];

    if (mode === NFTBalanceMode.OFFCHAIN) {
      const offChainResults = await this.prisma.nFTBalance.findMany({
        where: {
          user: {
            address: ownerAddress ? { equals: ownerAddress } : undefined,
          },
          nftAsset: {
            name: name ? { contains: name, mode: 'insensitive' } : undefined,
            tokenId: tokenIds ? { in: tokenIds.map((id) => id) } : undefined,
            collection: {
              projectId: projectID ? projectID : undefined,
              SmartContract: {
                some: {
                  contractAddress: { equals: collectionAddress },
                  id: contractID ? contractID : undefined,
                },
              },
            },
          },
        },
        select: {
          amount: true,
          user: { select: { address: true } },
          nftAsset: {
            select: {
              id: true,
              name: true,
              tokenId: true,
              description: true,
              media: true,
              metadata: true,
              collection: {
                select: {
                  SmartContract: {
                    select: { contractAddress: true, contractType: true },
                  },
                },
              },
            },
          },
        },
        skip,
        take,
      });
      console.log(offChainResults);

      combinedData = await this.fetchOnChainForOffChainResults(
        offChainResults,
        collectionAddress,
        ownerAddress,
      );
    } else if (mode === NFTBalanceMode.ONCHAIN) {
      combinedData = await this.fetchOnChainData(
        collectionAddress,
        tokenIds,
        ownerAddress,
        page,
        take,
      );

      for (const item of combinedData) {
        const offChainResult = await this.prisma.nFTBalance.findFirst({
          where: {
            nftAsset: {
              tokenId: item.tokenId,
              collection: {
                SmartContract: {
                  some: { contractAddress: { equals: collectionAddress } },
                },
              },
            },
          },
          select: { amount: true },
        });

        if (offChainResult) {
          item.offChainBalance = offChainResult.amount.toString();
        }
      }
    }

    const hasNext = combinedData.length > limit;
    const paginatedData = combinedData.slice(0, limit);

    return {
      data: paginatedData,
      paging: {
        page,
        limit,
        hasNext,
      },
    };
  }

  async getNFTAssets(
    filter: GetNFTAssetsDto,
  ): Promise<PagingResponseHasNext<NFTAssetResponse>> {
    const { page, limit, created_at } = filter;
    const take = limit + 1;

    try {
      const url = `${
        process.env.CRAWLER_URL
      }/chain/1/nft-assets?page=${page}&limit=${take}${
        created_at ? `&created_at_from=${created_at}` : ''
      }`;
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            'X-API-KEY': process.env.CRAWLER_KET,
          },
        }),
      );
      const nftAssets = response.data.data.data || [];
      const hasNext = nftAssets.length > limit;
      const paginatedData = await Promise.all(
        nftAssets.slice(0, limit).map(async (item: any) => {
          // Get or create collection
          const collection =
            await this.collectionService.findCollectionByContractAddress(
              item.assetId.split(':')[1],
            );
          if (collection) {
            // Check if NFT asset exists
            let nftAsset = await this.prisma.nFTAsset.findUnique({
              where: {
                tokenId_collectionId: {
                  collectionId: collection.id,
                  tokenId: item.tokenId,
                },
              },
              select: {
                id: true,
                media: true,
                metadata: true,
              },
            });

            // Create NFT asset if it doesn't exist
            if (!nftAsset) {
              nftAsset = await this.createNFTAsset(
                item.tokenId,
                collection.id,
                item.attributes,
              );
            }
            const project =
              await this.collectionService.findProjectByCollection(
                collection.id,
              );
            return {
              id: nftAsset?.id,
              name: item.name || '',
              type: item.tokenType,
              tokenId: item.tokenId,
              description: item.description || '',
              collectionAddress: item.assetId.split(':')[1],
              media: nftAsset?.media || null,
              metadata: nftAsset?.metadata || null,
              balance: item.balance,
              ownerAddress: item.owner,
              gameInfo: project || null,
              createdAt: item.createdAt,
            };
          }
          return null;

          // return {
          //   id: item.id,
          //   name: item.name || '',
          //   type: item.balance ? 'ERC1155' : 'ERC721',
          //   tokenId: item.tokenId,
          //   description: item.description || '',
          //   collectionAddress: item.collectionAddress,
          //   media: null,
          //   metadata: null,
          //   balance: item.balance,
          //   ownerAddress: item.owner,
          // };
        }),
      );

      return {
        data: paginatedData,
        paging: {
          page,
          limit,
          hasNext,
        },
      };
    } catch (error) {
      console.error('Error fetching NFT assets:', error);
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.OTHER_ERROR,
          message: 'Error fetching NFT assets',
        },
      });
    }
  }

  // Fetch equivalent on-chain data for off-chain records
  private async fetchOnChainForOffChainResults(
    offChainResults: Array<
      Prisma.NFTBalanceGetPayload<{
        select: {
          amount: true;
          user: { select: { address: true } };
          nftAsset: {
            select: {
              id: true;
              name: true;
              tokenId: true;
              description: true;
              media: true;
              metadata: true;
              collection: {
                select: {
                  SmartContract: {
                    select: { contractAddress: true; contractType: true };
                  };
                };
              };
            };
          };
        };
      }>
    >,
    collectionAddress: string,
    ownerAddress: string,
  ): Promise<NFTBalanceResponse[]> {
    const combinedData: NFTBalanceResponse[] = [];

    const tokenIds = offChainResults.map((result) =>
      OtherCommon.toFullNumberString(result.nftAsset.tokenId.toString()),
    );

    try {
      const queryParams = new URLSearchParams();
      tokenIds.forEach((tokenId) => queryParams.append('token_id', tokenId));
      if (ownerAddress) queryParams.append('owner', ownerAddress);
      const url = `${
        process.env.CRAWLER_URL
      }/chain/1/collection/${collectionAddress}/assets?${queryParams.toString()}`;

      let response;
      try {
        response = await lastValueFrom(
          this.httpService.get(url, {
            headers: {
              'X-API-KEY': process.env.CRAWLER_KET,
            },
          }),
        );
      } catch (err) {
        response = [];
        console.error('Failed to fetch from onchain', err);
      }
      const onChainData =
        response.length > 0
          ? (response.data.asset.data as NFTCrawlerRep[])
          : [];

      for (const balance of offChainResults) {
        const tokenIdStr = OtherCommon.toFullNumberString(
          balance.nftAsset.tokenId.toString(),
        );
        const onChainItem = onChainData.find(
          (item) =>
            item.tokenId === tokenIdStr && item.owner === balance.user.address,
        );
        const onChainBalance = onChainItem ? onChainItem.balance : '0';

        const collection =
          await this.collectionService.findCollectionByContractAddress(
            balance.nftAsset.collection?.SmartContract?.[0]?.contractAddress,
          );
        const existingNFTAsset = await this.prisma.nFTAsset.findUnique({
          where: {
            tokenId_collectionId: {
              tokenId: tokenIdStr,
              collectionId: collection.id,
            },
          },
        });

        if (!existingNFTAsset) {
          await this.createNFTAsset(
            tokenIdStr,
            collection.id,
            onChainItem.attributes,
          );
        }

        combinedData.push({
          id: balance.nftAsset.id,
          type: balance.nftAsset.collection.SmartContract[0].contractType,
          name: balance.nftAsset.name,
          tokenId: tokenIdStr,
          description: balance.nftAsset.description,
          collectionAddress:
            balance.nftAsset.collection?.SmartContract?.[0]?.contractAddress ||
            '',
          media: balance.nftAsset.media,
          metadata: balance.nftAsset.metadata,
          offChainBalance: balance.amount.toString(),
          onChainBalance: onChainBalance.toString(),
          ownerAddress: balance.user.address,
        });
      }
    } catch (error) {
      console.error('Error fetching on-chain data:', error.message);
    }

    return combinedData;
  }

  private async fetchOnChainData(
    collectionAddress: string,
    tokenIds: string[],
    ownerAddress: string,
    skip: number,
    take: number,
  ): Promise<NFTBalanceResponse[]> {
    const combinedData: NFTBalanceResponse[] = [];
    const queryParams = new URLSearchParams();
    if (tokenIds) tokenIds.forEach((id) => queryParams.append('token_id', id));
    if (ownerAddress) queryParams.append('owner', ownerAddress);
    queryParams.append('page', skip.toString());
    queryParams.append('limit', take.toString());
    const url = `${
      process.env.CRAWLER_URL
    }/chain/1/collection/${collectionAddress}/assets?${queryParams.toString()}`;
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            'X-API-KEY': process.env.CRAWLER_KET,
          },
        }),
      );
      const onChainData = response.data.asset.data as NFTCrawlerRep[];

      for (const item of onChainData) {
        const collection =
          await this.collectionService.findCollectionByContractAddress(
            collectionAddress,
          );
        let nftAsset = await this.prisma.nFTAsset.findUnique({
          where: {
            tokenId_collectionId: {
              collectionId: collection.id,
              tokenId: item.tokenId,
            },
          },
          select: {
            media: true,
            metadata: true,
          },
        });
        if (!nftAsset) {
          nftAsset = await this.createNFTAsset(
            item.tokenId,
            collection.id,
            item.attributes,
          );
        }

        combinedData.push({
          id: item.id,
          name: '',
          type: item.balance ? 'ERC1155' : 'ERC721',
          tokenId: item.tokenId,
          description: '',
          collectionAddress,
          media: nftAsset.media,
          metadata: nftAsset.metadata,
          offChainBalance: '0',
          onChainBalance: item.balance,
          ownerAddress: item.owner,
        });
      }
    } catch (error) {
      console.error('Error fetching on-chain data:', error.message);
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.OTHER_ERROR,
          message: 'Error fetching onchain data',
        },
      });
    }

    return combinedData;
  }

  private async createNFTAsset(
    tokenId: string,
    collectionId: string,
    metadataUri: string,
  ) {
    try {
      // Fetch metadata if available
      let metadataJson = null;
      try {
        if (metadataUri) {
          const metadataResponse = await lastValueFrom(
            this.httpService.get(metadataUri),
            // this.httpService.get(
            //   'https://ipfs-gw.u2quest.io/ipfs/QmcSGmKhE5VTseFaonBNFnPPmEXSzxRDUEYL99m4QdPgmn/1',
            // ),
          );
          metadataJson = metadataResponse.data;
        }
      } catch (metadataError) {
        console.error(
          `Failed to fetch metadata for tokenId ${tokenId}: ${metadataError.message}`,
        );
      }

      // Create the NFTAsset and related records
      const newNFTAsset = await this.prisma.nFTAsset.create({
        data: {
          tokenId: tokenId,
          collectionId,
          name: '', // Name can be set based on metadata if available
          description: metadataJson?.description || '',
          metadata: {
            create: {
              IPFSUrl: metadataUri,
              metadata: metadataJson || {},
            },
          },
          media: metadataJson?.image
            ? {
                create: {
                  S3Url: '', // Assuming media is not stored in S3 directly
                  IPFSUrl: metadataJson.image,
                },
              }
            : undefined,
        },
        select: {
          id: true,
          media: true,
          metadata: true,
        },
      });

      return newNFTAsset;
    } catch (error) {
      console.error(
        `Failed to create NFTAsset for tokenId ${tokenId}: ${error.message}`,
      );
      return null;
    }
  }
}
