import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { env } from 'src/env';
import { PrismaService } from 'src/prisma/prisma.service';
import { cloudflare } from 'src/upload/utils/cloudflare.config';
import {
  extractKeyFromURL,
  normalizeString,
  toUrlFriendlyString,
} from 'src/utils';
@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  private _userOrPublicFilter(userId: string) {
    return {
      OR: [
        { owner_id: userId },
        { uploaded_by_id: userId },
        { isPublic: true },
      ],
    };
  }

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

  async getUserDocuments(userId: string) {
    return this.prisma.document.findMany({
      where: this._userOrPublicFilter(userId),
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentsByCategory(userId: string, category: string) {
    if (!category) return [];
    return this.prisma.document.findMany({
      where: {
        category: { search: normalizeString(category) },
        ...this._userOrPublicFilter(userId),
        NOT: { isPublic: true }, // ignora públicos
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentsSharedWithProfessional(professionalId: string) {
    const patients = await this.prisma.professionalPatient.findMany({
      where: {
        professionalId,
      },
      select: { patientId: true },
    });

    const patientIds = patients.map((p) => p.patientId);

    if (patientIds.length === 0) return [];

    const documents = await this.prisma.document.findMany({
      where: {
        type: { in: ['PATIENT_TO_PROFESSIONAL', 'PROFESSIONAL_TO_PATIENT'] },
        OR: [
          { owner_id: { in: patientIds } },
          { uploaded_by_id: { in: patientIds } },
        ],
      },
      include: { uploaded_by: true, owner: true },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  async getDocumentsFromProfessional(
    professionalId: string,
    patientId: string,
  ) {
    return this.prisma.document.findMany({
      where: {
        uploaded_by_id: professionalId,
        owner_id: patientId,
        type: 'PROFESSIONAL_TO_PATIENT',
      },
      orderBy: { createdAt: 'desc' },
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

  async deleteDocument(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with id ${documentId} not found`);
    }

    if (document.uploaded_by_id !== userId) {
      throw new UnauthorizedException(
        `User ${userId} doesn't uploaded document ${documentId}`,
      );
    }

    try {
      const key = extractKeyFromURL(document.url);
      await cloudflare.send(
        new DeleteObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: key,
        }),
      );

      await this.prisma.document.delete({
        where: { id: documentId },
      });
      return { deleted: true };
    } catch (error) {
      throw error;
    }
  }
}
