import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DocumentCategory } from '@prisma/client';

export class GetDocumentsDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  uploadedById?: string;

  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;
}
