import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { CreateSmcDto } from './dto/create-smc.dto';
import { SmartContractFilterDto } from './dto/query-smc.dto';
import OtherCommon from '../../commons/Other.common';

@Injectable()
export class SmartContractService {
  constructor(private prisma: PrismaService) {}
  NETWORK_RPC_URLS: { [chainId: number]: string } = {
    2484: 'https://rpc-nebulas-testnet.uniultra.xyz',
  };

  private getProvider(chainID: number): ethers.Provider {
    const rpcUrl = this.NETWORK_RPC_URLS[chainID];

    if (!rpcUrl) {
      throw new Error(`Unsupported chain ID: ${chainID}`);
    }

    return new ethers.JsonRpcProvider(rpcUrl);
  }

  async deployERC721Contract(data: CreateSmcDto) {
    const { contractName, tokenSymbol, contractType } = data;
    // TODO: COMPLETE contract deploy flow
    // const provider = this.getProvider(chainID);

    // const signer = new ethers.Wallet(
    //   process.env.DEPLOYER_PRIVATE_KEY,
    //   provider,
    // );

    // const factory = new ethers.ContractFactory(
    //   ERC721_ABI,
    //   ERC721_BYTECODE,
    //   signer,
    // );

    // const contract = await factory.deploy(contractName, tokenSymbol);

    // await contract.deployTransaction.wait();

    // const contractAddress = contract.address;

    const smartContract = await this.prisma.smartContract.create({
      data: {
        contractType: contractType,
        networkID: 2484,
        contractName: contractName,
        tokenSymbol: tokenSymbol,
        contractAddress: '0xabc',
        // deployedAt: new Date(),
      },
    });

    return smartContract;
  }

  async getSmartContracts(filter: SmartContractFilterDto): Promise<
    PagingResponse<
      Prisma.SmartContractGetPayload<{
        include: { collection: true; deployedOn: true };
      }>
    >
  > {
    const {
      networkID,
      contractType,
      contractAddress,
      contractName,
      projectId,
      page,
      limit,
    } = filter;

    // Calculate pagination parameters
    const skip = (page - 1) * limit;
    const take = limit;

    const whereSmc: Prisma.SmartContractWhereInput = {
      networkID,
      contractType: contractType ? { equals: contractType } : undefined,
      contractAddress: { equals: contractAddress, mode: 'insensitive' },
      collection: {
        projectId: projectId ? projectId : undefined,
      },
      OR: contractName
        ? [
            {
              nameSlug: {
                contains: OtherCommon.stringToSlug(contractName),
                mode: 'insensitive',
              },
            },
            {
              tokenSymbol: {
                contains: contractName,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };

    const smartContracts = await this.prisma.smartContract.findMany({
      where: whereSmc,
      include: {
        deployedOn: true,
        collection: true,
      },
      skip,
      take,
    });

    const totalCount = await this.prisma.smartContract.count({
      where: whereSmc,
    });

    return {
      data: smartContracts,
      paging: {
        page,
        limit,
        total: totalCount,
      },
    };
  }

  // Method to get details of a specific smart contract by ID
  async getSmartContractById(id: string) {
    const smartContract = await this.prisma.smartContract.findUnique({
      where: { id },
      include: {
        deployedOn: true,
        collection: true,
      },
    });

    if (!smartContract) {
      throw new NotFoundException(`Smart Contract with ID ${id} not found`);
    }

    return smartContract;
  }
}
