import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DocumentCategory } from '@prisma/client';

export class UploadDocumentDto {
  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @IsOptional()
  @IsUUID()
  ownerId?: string; // paciente, se aplicável
}