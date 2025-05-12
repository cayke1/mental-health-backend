import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { env } from 'src/env';
import { PrismaService } from 'src/prisma/prisma.service';
import { cloudflare } from 'src/upload/utils/cloudflare.config';
import { normalizeString, toUrlFriendlyString } from 'src/utils';
@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument({
    file,
    category,
    type,
    userId,
    ownerId,
    isPublic,
  }: {
    file: Express.Multer.File;
    category?: string;
    type: DocumentType;
    userId: string;
    ownerId?: string;
    isPublic?: boolean;
  }) {
    try {
      const prefix = this._resolvePrefix(type, userId, ownerId, isPublic);
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
          type,
          url,
          isPublic: isPublic ?? false,
          uploaded_by_id: userId,
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
    type: DocumentType,
    userId: string,
    ownerId?: string,
    isPublic?: boolean,
  ): string {
    console.log(isPublic);
    switch (type) {
      case 'MODEL': {
        return 'documents/models';
      }
      case 'PATIENT_UPLOAD': {
        if (isPublic) {
          return `documents/patients/public/${userId}`; // Public uploads
        }
        return `documents/patients/${userId}`;
      }
      case 'PROFESSIONAL_UPLOAD': {
        if (isPublic) {
          return `documents/professionals/public/${userId}`; // Public uploads
        }
        return `documents/professionals/${userId}`;
      }
      case 'PATIENT_TO_PROFESSIONAL': {
        if (!ownerId)
          throw new Error(
            'ownerId is required for PATIENT_TO_PROFESSIONAL type',
          );
        return `documents/patients/${userId}/professional/${ownerId}`;
      }
      case 'PROFESSIONAL_TO_PATIENT': {
        if (!ownerId)
          throw new Error(
            'ownerId is required for PROFESSIONAL_TO_PATIENT type',
          );
        return `documents/professionals/${userId}/patient/${ownerId}`;
      }

      default:
        throw new Error(
          `Invalid document category: ${type}. Valid categories are: MODEL, PATIENT_UPLOAD, PROFESSIONAL_UPLOAD`,
        );
    }
  }

  async getMyDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: {
        OR: [
          { owner_id: userId },
          { uploaded_by_id: userId },
          { isPublic: true },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDocumentByCategory(category: string, userId: string) {
    if (!category) return;
    return this.prisma.document.findMany({
      where: {
        category: {
          search: normalizeString(category),
        },
        OR: [
          { owner_id: userId },
          { uploaded_by_id: userId },
          { isPublic: true },
        ],
        NOT: {
          isPublic: true,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPatientsDocs(userId: string) {
    return this.prisma.document.findMany({
      where: {
        owner_id: userId,
        OR: [
          { type: 'PATIENT_TO_PROFESSIONAL' },
          { type: 'PROFESSIONAL_TO_PATIENT' },
        ],
      },
      include: {
        uploaded_by: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getProfessionalDocs(professionalId: string, userId: string) {
    return this.prisma.document.findMany({
      where: {
        owner_id: userId,
        type: 'PROFESSIONAL_TO_PATIENT',
        uploaded_by_id: professionalId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getModels(category?: string) {
    return this.prisma.document.findMany({
      where: {
        type: 'MODEL',
        ...(category && { category }),
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
