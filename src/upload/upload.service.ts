import { Injectable } from '@nestjs/common';
import { cloudflare } from './utils/cloudflare.config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from 'src/env';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

@Injectable()
export class UploadService {
  constructor() {}
  async saveFileMetadata(file: Express.Multer.File, type: 'IMAGE' | 'PDF') {
    try {
      const filename = `${randomUUID()}-${extname(file.originalname)}`;
      await cloudflare.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const publicUrl = `${env.R2_ENDPOINT}/${env.R2_BUCKET}/${filename}`;
      return { message: `${type} uploaded`, url: publicUrl };
    } catch (error) {
      console.log(error);
    }
  }
}
