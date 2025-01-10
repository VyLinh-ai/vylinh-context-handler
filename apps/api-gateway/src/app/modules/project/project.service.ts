import { PrismaService } from '@layerg-agg-workspace/shared/services';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ProjectFilterDto } from './dto/query-project.dto';
import { Prisma, Project } from '@prisma/client';
import OtherCommon from '../../commons/Other.common';

@Injectable()
export class ProjectService {
  constructor(
    readonly prisma: PrismaService,
    readonly apiKeyService: AuthService,
  ) {}
  async createProject(name: string, apiKey: string) {
    const apiKeyData = await this.prisma.aPIKey.findUnique({
      where: { apiKey },
    });

    if (!apiKeyData) {
      throw new UnauthorizedException('API key not found');
    }

    if (apiKeyData.isBlackListed) {
      throw new UnauthorizedException('API key is blacklisted');
    }

    const existingProject = await this.prisma.project.findFirst({
      where: { name },
    });

    if (existingProject) {
      throw new BadRequestException('Project with this name already exists');
    }

    const newProject = await this.prisma.project.create({
      data: {
        name,
        apiKeyID: apiKeyData.id,
      },
    });

    return newProject;
  }

  async getProjects(
    filter: ProjectFilterDto,
  ): Promise<PagingResponse<Project>> {
    const { platform, isEnabled, name, categories, page, limit } = filter;

    const skip = (page - 1) * limit;
    const take = limit;

    const whereClause: Prisma.ProjectWhereInput = {
      platform: platform ? { hasSome: platform } : undefined,
      isEnabled: isEnabled ?? undefined,
      nameSlug: name
        ? {
            contains: OtherCommon.stringToSlug(name),
            mode: 'insensitive',
          }
        : undefined,
    };

    // Add category filter if provided
    if (categories && categories.length > 0) {
      whereClause.categories = {
        some: {
          name: {
            in: categories,
          },
        },
      };
    }

    const [projects, totalCount] = await Promise.all([
      this.prisma.project.findMany({
        where: whereClause,
        include: {
          categories: true,
          collections: {
            include: {
              SmartContract: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.project.count({
        where: whereClause,
      }),
    ]);

    return {
      data: projects,
      paging: {
        page,
        limit,
        total: totalCount,
      },
    };
  }

  async getProjectById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        categories: true,
        collections: {
          include: {
            SmartContract: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async getAllCategories() {
    return await this.prisma.category.findMany();
  }
  // async addCategoriesToProject(projectId: string, categoryIds: string[]) {
  //   const project = await this.prisma.project.findUnique({
  //     where: { id: projectId },
  //   });

  //   if (!project) {
  //     throw new NotFoundException(`Project with ID ${projectId} not found`);
  //   }

  //   return await this.prisma.project.update({
  //     where: { id: projectId },
  //     data: {
  //       categories: {
  //         connect: categoryIds.map(id => ({ id })),
  //       },
  //     },
  //     include: {
  //       categories: true,
  //     },
  //   });
  // }

  // async removeCategories(projectId: string, categoryIds: string[]) {
  //   const project = await this.prisma.project.findUnique({
  //     where: { id: projectId },
  //   });

  //   if (!project) {
  //     throw new NotFoundException(`Project with ID ${projectId} not found`);
  //   }

  //   return await this.prisma.project.update({
  //     where: { id: projectId },
  //     data: {
  //       categories: {
  //         disconnect: categoryIds.map(id => ({ id })),
  //       },
  //     },
  //     include: {
  //       categories: true,
  //     },
  //   });
  // }
}
