import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import { Roles } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentService.uploadDocument({
      file,
      ...dto,
      userId: req.user.sub,
    });
  }

  @Get()
  async getDocuments(@Request() req: AuthenticatedRequest) {
    const { sub, role } = req.user;
    if (role === 'PROFESSIONAL') {
      return this.documentService.getDocumentsForProfessional(sub);
    }
    if (role === 'PATIENT') {
      return this.documentService.getDocumentsForPatient(sub);
    }

    throw new BadRequestException('Invalid user role');
  }

  @Roles([Role.PROFESSIONAL])
  @Get('models')
  async getModels() {
    return this.documentService.getModels();
  }
}
