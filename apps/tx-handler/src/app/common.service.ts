import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { PINATA_GATEWAYS } from '@layerg-agg-workspace/shared/constants';
import { OtherCommon } from '@layerg-agg-workspace/shared/utils';
import 'multer';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CommonService {
  private readonly s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
  });

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => {
      const filename = uuidv4() + '-' + file.originalname;
      const contentType = file.mimetype;

      return this.s3
        .upload({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: filename,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: contentType,
        })
        .promise()
        .then(() => {
          return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
        });
    });

    return Promise.all(uploadPromises);
  }

  // Upload files to Pinata
  async uploadFilesToIPFS(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const fileUrls = [];

      for (const file of files) {
        const formData = new FormData();
        const blob = new Blob([file.buffer]);
        const pinataMetadata = JSON.stringify({
          name: file.originalname,
        });

        formData.append('file', blob, file.originalname);
        formData.append('pinataMetadata', pinataMetadata);

        const result = await new OtherCommon().postPinata(formData, {
          API_KEY: process.env.API_KEY_PINATA,
          API_SECRET: process.env.API_SECRET_PINATA,
        });
        if (!result || !result.IpfsHash) {
          throw new Error('Failed to upload file to Pinata');
        }

        const fileUrl = `${PINATA_GATEWAYS}/ipfs/${result.IpfsHash}`;
        fileUrls.push(fileUrl);
      }

      return fileUrls;
    } catch (err) {
      console.error('Error uploading files to IPFS:', err);
      throw new Error('File upload failed');
    }
  }

  async uploadMetadataToIPFS(metadata: any): Promise<string> {
    if (!metadata) {
      throw new Error('No metadata provided');
    }

    // Upload JSON metadata as-is, without requiring file URLs
    const metaDataUpload = JSON.stringify({
      pinataContent: metadata, // This is the metadata object
      pinataMetadata: {
        name: `metadata.json`, // Name for the metadata file
      },
    });

    // Assuming `CommonHelper.uploadMetadataToIPFS` handles the request to Pinata
    const result = await new OtherCommon().uploadMetadataToIPFS(
      metaDataUpload,
      {
        API_KEY: process.env.API_KEY_PINATA,
        API_SECRET: process.env.API_SECRET_PINATA,
      },
    );
    return `${PINATA_GATEWAYS}/ipfs/${result.IpfsHash}`;
  }
}
