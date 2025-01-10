import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { FilesInterceptor } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'multer';
import { JwtAuthGuard } from '../auth/guards/api-key.guard';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.commonService.uploadMultipleFiles(files);
  }
  @Post('upload-file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFileToIPFS(@UploadedFiles() files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new Error('File is required!');
    }

    const result = await this.commonService.uploadFilesToIPFS(files);
    return {
      ipfsHash: result,
    };
  }
}
