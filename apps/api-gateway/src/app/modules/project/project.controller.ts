import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../auth/guards/api-key.guard';
import { CurrentAPIKey } from '../../commons/decorators/CurrentAPIKey.decorator';
import { APIKey } from '@prisma/client';
import { ProjectFilterDto } from './dto/query-project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createProject(
    @Body() name: CreateProjectDto,
    @CurrentAPIKey() key: APIKey,
  ) {
    const project = await this.projectService.createProject(
      name.name,
      key.apiKey,
    );

    return project;
  }

  @Get('categories')
  async getAvailableCatogories() {
    return await this.projectService.getAllCategories();
  }

  @Get()
  async getProjects(@Query() filter: ProjectFilterDto) {
    return this.projectService.getProjects(filter);
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    return this.projectService.getProjectById(id);
  }

  // @Put(':id/categories')
  // @UseGuards(JwtAuthGuard)
  // async addCategories(
  //   @Param('id') id: string,
  //   @Body() dto: ManageCategoriesDto,
  // ) {
  //   return this.projectService.addCategoriesToProject(id, dto.categoryIds);
  // }

  // @Delete(':id/categories')
  // @UseGuards(JwtAuthGuard)
  // async removeCategories(
  //   @Param('id') id: string,
  //   @Body() dto: ManageCategoriesDto,
  // ) {
  //   return this.projectService.removeCategories(id, dto.categoryIds);
  // }
}
