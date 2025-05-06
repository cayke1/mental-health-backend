import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { DocumentCategory } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { env } from 'src/env';
import { PrismaService } from 'src/prisma/prisma.service';
import { cloudflare } from 'src/upload/utils/cloudflare.config';
import { toUrlFriendlyString } from 'src/utils';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument({
    file,
    category,
    userId,
    ownerId,
  }: {
    file: Express.Multer.File;
    category: DocumentCategory;
    userId: string;
    ownerId?: string;
  }) {
    try {
      const prefix = this._resolvePrefix(category, userId, ownerId);
      const filename = `${randomUUID()}-${toUrlFriendlyString(file.originalname)}`;
      const key = `${prefix}/${filename}`;

      await cloudflare.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const url = `${env.CDN_URL}/${key}`;

      const document = await this.prisma.document.create({
        data: {
          filename: file.originalname,
          category,
          url,
          updated_by_id: userId,
          owner_id: ownerId ?? null,
          mimeType: file.mimetype,
        },
      });

      return document;
    } catch (error) {
      console.log(error);
    }
  }

  private _resolvePrefix(
    category: DocumentCategory,
    userId: string,
    ownerId?: string,
  ): string {
    switch (category) {
      case 'MODEL': {
        return 'documents/models';
      }
      case 'PATIENT_UPLOAD': {
        if (!ownerId)
          throw new Error('Owner ID is required for PATIENT_UPLOAD category');
        return `documents/patients/${userId}`;
      }
      case 'PROFESSIONAL_UPLOAD': {
        if (ownerId) return `documents/professionals/patients/${ownerId}`;
        return `documents/professionals/${userId}`;
      }

      default:
        throw new Error(
          `Invalid document category: ${category}. Valid categories are: MODEL, PATIENT_UPLOAD, PROFESSIONAL_UPLOAD`,
        );
    }
  }
}
