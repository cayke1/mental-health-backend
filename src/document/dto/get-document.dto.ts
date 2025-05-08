import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

export class GetDocumentsDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  uploadedById?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  category?: string;
}
