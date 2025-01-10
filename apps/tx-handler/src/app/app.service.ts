import {
  MempoolTxDto,
  MintNftOffchainDto,
  MintNftOffchainRawdata,
  TransactionType,
  TransferNftOffchainDto,
} from '@layerg-agg-workspace/shared/dto';
import { Injectable } from '@nestjs/common';
import { Tx712Handler } from '@layerg-agg-workspace/shared/utils';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import {
  ContractType,
  NFTAsset,
  Prisma,
  TX_STATUS,
  User,
} from '@prisma/client';
import { CommonService } from './common.service';
import { ConversionHelperService } from './conversion-helper.service';

@Injectable()
export class AppService {
  private tx712Handler: Tx712Handler;

  constructor(
    readonly prisma: PrismaService,
    readonly conversion: ConversionHelperService,
    readonly common: CommonService,
  ) {
    this.tx712Handler = new Tx712Handler();
  }

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async handleTx(data: MempoolTxDto) {
    const { txType } = data;

    // const recoveredAddress = await this.tx712Handler.verifySignature(
    //   hash,
    //   signature,
    // );

    // if (recoveredAddress !== signerAddress) {
    //   console.error('Invalid signature');
    //   return;
    // }

    // Handle the transaction based on the txType
    try {
      switch (txType) {
        case TransactionType.MINT_NFT:
          await this.handleMintNft(data.rawData as MintNftOffchainDto);
          break;
        case TransactionType.TRANSFER_NFT:
          await this.handleTransferNft(data.rawData as TransferNftOffchainDto);
          break;
        default:
          throw new Error('Invalid transaction type');
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  private async handleMintNft(dto: MintNftOffchainDto) {
    const user = await this.getUserByAddress(dto.recipient);
    const nft = await this.getNftById(dto.nftId);
    // // check signer for transaction
    // if (user.address !== dto.signerAddress) {
    //   throw new Error('Invalid signer');
    // }

    // handle ERC721 or ERC1155 NFT
    let contractType;
    try {
      contractType = await this.getNftType(dto.nftId);
    } catch (err) {
      throw new Error(err);
    }
    const txHistory = await this.prisma.tXHistory.create({
      data: {
        type: contractType,
        amount: dto.amount,
        from: user.address,
        to: user.address,
        status: TX_STATUS.PENDING,
      },
    });

    try {
      // // handle minting NFT
      // if (dto.amount > Number(nft.quantity)) {
      //   throw new Error('Not enough NFTs to mint');
      // }

      switch (contractType) {
        case ContractType.ERC721:
          await this.handleMintERC721NFT(dto, user, nft);
          break;
        case ContractType.ERC1155:
          await this.handleMintERC1155NFT(dto, user, nft);
          break;
      }
    } catch (error) {
      await this.prisma.tXHistory.update({
        where: {
          id: txHistory.id,
        },
        data: {
          status: TX_STATUS.FAILED,
        },
      });
      throw Error(error);
    }

    await this.prisma.tXHistory.update({
      where: {
        id: txHistory.id,
      },
      data: {
        status: TX_STATUS.SUCCESS,
      },
    });
  }

  private async handleTransferNft(dto: TransferNftOffchainDto) {
    // handle transfer NFT
    const fromUser = await this.getUserByAddress(dto.from);
    const toUser = await this.getUserByAddress(dto.to);

    const nft = await this.getNftById(dto.nftId);

    const contractType = await this.getNftType(dto.nftId);

    const txHistory = await this.prisma.tXHistory.create({
      data: {
        type: contractType,
        amount: dto.amount,
        from: fromUser.address,
        to: toUser.address,
        status: TX_STATUS.PENDING,
      },
    });

    try {
      // check NFT balance
      const fromUserNft = await this.prisma.nFTBalance.findUnique({
        where: {
          userId_nftAssetId: {
            userId: fromUser.id,
            nftAssetId: nft.id,
          },
        },
      });

      if (!fromUserNft || BigInt(fromUserNft.amount.toString()) < dto.amount) {
        throw new Error('Not enough NFTs to transfer');
      }

      // valid condition
      await this.prisma.$transaction(async (tx) => {
        // substract NFT from sender
        await tx.nFTBalance.update({
          where: {
            id: fromUserNft.id,
            version: fromUserNft.version,
          },
          data: {
            amount: (
              BigInt(fromUserNft.amount.toString()) - BigInt(dto.amount)
            ).toString(),
          },
        });

        // check if whether receiver has NFT or not
        // create new if recipient doesn't have NFT
        // update amount if recipient has NFT
        const toUserNft = await tx.nFTBalance.findUnique({
          where: {
            userId_nftAssetId: {
              userId: toUser.id,
              nftAssetId: nft.id,
            },
          },
        });

        if (!toUserNft) {
          // mint new NFT
          await tx.nFTBalance.create({
            data: {
              userId: toUser.id,
              nftAssetId: nft.id,
              amount: dto.amount,
            },
          });
        } else {
          // update NFT amount
          await tx.nFTBalance.update({
            where: {
              id: toUserNft.id,
              version: toUserNft.version,
            },
            data: {
              amount: (
                BigInt(toUserNft.amount.toString()) + BigInt(dto.amount)
              ).toString(),
            },
          });
        }
      });
    } catch (error) {
      await this.prisma.tXHistory.update({
        where: {
          id: txHistory.id,
        },
        data: {
          status: TX_STATUS.FAILED,
        },
      });
      throw Error(error);
    }

    await this.prisma.tXHistory.update({
      where: {
        id: txHistory.id,
      },
      data: {
        status: TX_STATUS.SUCCESS,
      },
    });
  }

  private async handleMintERC721NFT(
    dto: MintNftOffchainRawdata,
    user: User,
    nft: NFTAsset,
  ) {
    if (BigInt(dto.amount) !== 1n) {
      throw new Error('Invalid amount for ERC721 NFT');
    }

    // check whether nft is minted yet
    const mintedNft = await this.prisma.nFTBalance.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        nftAssetId: dto.nftId,
      },
    });

    // ERC 721 NFT can only be minted once
    if (
      mintedNft._sum?.amount &&
      BigInt(mintedNft._sum.amount.toString()) > 0
    ) {
      throw new Error('NFT is already minted');
    }

    // valid condition
    // mint NFT
    await this.prisma.nFTBalance.create({
      data: {
        userId: user.id,
        nftAssetId: nft.id,
        amount: 1,
      },
    });
    await this.toIPFS(nft.id);
  }

  private async handleMintERC1155NFT(
    dto: MintNftOffchainRawdata,
    user: User,
    nft: NFTAsset,
  ) {
    // check whether nft is minted yet
    const mintedNft = await this.prisma.nFTBalance.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        nftAssetId: dto.nftId,
      },
    });

    // check cap of NFT1155
    if (mintedNft._sum?.amount) {
      const nftLeft =
        BigInt(nft.quantity.toString()) -
        BigInt(mintedNft._sum.amount.toString());
      if (nftLeft < BigInt(dto.amount)) {
        throw new Error('Not enough NFTs to mint');
      }
    } else if (BigInt(dto.amount) > BigInt(nft.quantity.toString())) {
      throw new Error('Not enough NFTs to mint');
    }

    // valid condition
    await this.prisma.$transaction(async (tx) => {
      // mint NFT
      const userNft = await tx.nFTBalance.findUnique({
        where: {
          userId_nftAssetId: {
            userId: user.id,
            nftAssetId: nft.id,
          },
        },
      });

      if (!userNft) {
        // mint new NFT
        await tx.nFTBalance.create({
          data: {
            userId: user.id,
            nftAssetId: nft.id,
            amount: dto.amount,
          },
        });
      } else {
        // update NFT amount
        await tx.nFTBalance.update({
          where: {
            id: userNft.id,
          },
          data: {
            amount: (
              BigInt(userNft.amount.toString()) + BigInt(dto.amount)
            ).toString(),
          },
        });
      }
    });
    await this.toIPFS(nft.id);
  }

  private async toIPFS(nftId: string) {
    const nftDetail = await this.getNftById(nftId);
    let ipfsUrl = nftDetail.media.IPFSUrl;
    if (!nftDetail.media.IPFSUrl) {
      ipfsUrl = await this.conversion.uploadS3MediaToIPFS(
        nftDetail.media.S3Url,
        nftDetail.tokenId.toString(),
      );
      // TODO: append this ipfs url to metadata and upload
      await this.prisma.mediaStorage.update({
        where: {
          AssetId: nftDetail.id,
        },
        data: {
          IPFSUrl: ipfsUrl,
        },
      });
    }
    if (!nftDetail.metadata.IPFSUrl) {
      const metadataUrl = await this.common.uploadMetadataToIPFS({
        ...nftDetail.metadata,
        imageUrl: ipfsUrl,
      });
      await this.prisma.metadata.update({
        where: {
          AssetId: nftDetail.id,
        },
        data: {
          IPFSUrl: metadataUrl,
        },
      });
    }
  }

  async getUserByAddress(address: string): Promise<User> {
    let user = await this.prisma.user.findUnique({
      where: {
        address,
      },
    });
    if (!user) {
      // throw new Error('User not found');
      user = await this.prisma.user.create({
        data: {
          address,
        },
      });
    }
    return user;
  }

  private async getNftById(
    nftId: string,
  ): Promise<
    Prisma.NFTAssetGetPayload<{ include: { media: true; metadata: true } }>
  > {
    // get NFT by id

    const nft = this.prisma.nFTAsset.findUnique({
      where: {
        id: nftId,
      },
      include: {
        media: true,
        metadata: true,
      },
    });
    if (!nft) {
      throw new Error('NFT not found');
    }

    return nft;
  }

  private async getNftType(nftId: string): Promise<ContractType> {
    const nft = await this.prisma.nFTAsset.findFirst({
      select: {
        collection: {
          select: {
            SmartContract: true,
          },
        },
      },
      where: {
        id: nftId,
      },
    });
    if (!nft) {
      throw new Error('NFT not found');
    }
    if (nft.collection.SmartContract.length === 0) {
      throw new Error('Contract has not been deployed yet');
    }
    return nft.collection.SmartContract[0].contractType;
  }
}
