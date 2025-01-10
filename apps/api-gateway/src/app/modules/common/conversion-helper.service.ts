import { BadRequestException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { CommonService } from './common.service';
import { Readable } from 'stream';

@Injectable()
export class ConversionHelperService {
  constructor(readonly common: CommonService) {}
  private readonly s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
  });
  private parseS3Url(s3Url: string): { Bucket: string; Key: string } {
    const url = new URL(s3Url);
    const bucket = url.hostname.split('.')[0];
    const key = url.pathname.slice(1);
    return { Bucket: bucket, Key: key };
  }
  // Helper function to upload media from S3 to IPFS
  async uploadS3MediaToIPFS(
    s3Url: string,
    nftAssetId: string,
  ): Promise<string> {
    const s3BucketParams = this.parseS3Url(s3Url);

    // Fetch the file from S3
    const s3File = await this.s3.getObject(s3BucketParams).promise();

    if (!s3File || !s3File.Body) {
      throw new BadRequestException('Failed to fetch media from S3');
    }

    // Wrap the file in an Express.Multer.File object to upload via IPFS
    const fileToUpload: Express.Multer.File = {
      fieldname: 'media',
      originalname: `${nftAssetId}.media`,
      encoding: '7bit',
      mimetype: s3File.ContentType || 'application/octet-stream',
      size: s3File.ContentLength || 0,
      buffer: s3File.Body as Buffer,
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };

    const ipfsUrls = await this.common.uploadFilesToIPFS([fileToUpload]);

    return ipfsUrls[0]; // Return the IPFS URL of the uploaded media
  }
}
