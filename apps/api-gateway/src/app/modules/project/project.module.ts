import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '@layerg-agg-workspace/shared/services';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, AuthService, PrismaService],
})
export class ProjectModule {}
