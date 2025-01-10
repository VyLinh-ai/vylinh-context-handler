import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { PrismaService } from '@layerg-agg-workspace/shared/services';
import { APIKey, Collection } from '@prisma/client';
import OtherError from '../../commons/errors/OtherError.error';
import { EErrorCode } from '../../commons/enums/Error.enum';
import { CollectionFilterDto } from './dto/query-collection.dto';

@Injectable()
export class CollectionService {
  constructor(readonly prisma: PrismaService) {}
  async create(createCollectionDto: CreateCollectionDto, key: APIKey) {
    const { name, description, avatarUrl, projectID } = createCollectionDto;
    // TODO: add webhook to x721
    const project = await this.prisma.project.findUnique({
      where: { id: projectID },
    });
    if (project.apiKeyID !== key.id) {
      throw new OtherError({
        errorInfo: {
          code: EErrorCode.INPUT_ERROR,
          message: 'Project ID does not belong to API key',
        },
      });
    }
    return await this.prisma.collection.create({
      data: {
        name,
        description,
        avatarUrl,
        projectId: projectID,
      },
    });
  }
  async getCollections(
    filter: CollectionFilterDto,
  ): Promise<PagingResponse<Collection>> {
    const { projectId, page, limit } = filter;

    // Calculate pagination parameters
    const skip = (page - 1) * limit;
    const take = limit;

    const collections = await this.prisma.collection.findMany({
      where: {
        projectId,
      },
      include: {
        project: true,
      },
      skip,
      take,
    });

    const totalCount = await this.prisma.collection.count({
      where: {
        projectId,
      },
    });

    return {
      data: collections,
      paging: {
        page,
        limit,
        total: totalCount,
      },
    };
  }

  // Method to get details of a specific collection by ID
  async getCollectionById(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return collection;
  }

  async findCollectionByContractAddress(
    contractAddress: string,
  ): Promise<Collection> {
    const smartContract = await this.prisma.smartContract.findUnique({
      where: {
        contractAddress_networkID: { contractAddress, networkID: 2484 },
      },
      select: { collection: true }, // Only retrieve Collection ID
    });

    if (!smartContract || !smartContract.collection) {
      // throw new NotFoundException(
      //   `Collection not found for contract address: ${contractAddress}`,
      // );
      console.error(
        `Collection not found for contract address: ${contractAddress}`,
      );
      return null;
    }

    return smartContract.collection;
  }

  async findProjectByCollection(id: string) {
    const { project } = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return project;
  }
}
