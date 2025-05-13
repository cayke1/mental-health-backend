import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document upload payload',
    type: UploadDocumentDto,
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or payload' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentService.uploadDocument({
      file,
      ...dto,
      isPublic: dto.isPublic === 'true' ? true : false,
      userId: req.user.sub,
    });
  }

  @Get('my')
  @Roles([Role.PATIENT, Role.PROFESSIONAL])
  @ApiOperation({ summary: 'Get documents uploaded by the current user' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async getMyDocuments(@Request() req: AuthenticatedRequest) {
    return this.documentService.getUserDocuments(req.user.sub);
  }

  @Get('professional')
  @Roles([Role.PATIENT])
  @ApiOperation({ summary: 'Get documents of a professional (for patients)' })
  @ApiQuery({ name: 'professionalId', required: true })
  @ApiResponse({ status: 200, description: 'Documents of the professional' })
  async getProfessionalDocs(
    @Request() req: AuthenticatedRequest,
    @Query('professionalId') professionalId: string,
  ) {
    return this.documentService.getDocumentsFromProfessional(
      professionalId,
      req.user.sub,
    );
  }

  @Get('categories')
  @Roles([Role.PROFESSIONAL])
  @ApiOperation({ summary: 'Get documents by category (for professionals)' })
  @ApiQuery({ name: 'category', required: true })
  @ApiResponse({ status: 200, description: 'Documents under the category' })
  async getByCategory(
    @Query('category') category: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.documentService.getDocumentsByCategory(category, req.user.sub);
  }

  @Get('patients')
  @Roles([Role.PROFESSIONAL])
  @ApiOperation({
    summary: 'Get documents from all patients (for professionals)',
  })
  @ApiResponse({ status: 200, description: 'Documents of all patients' })
  async getPatientsDocs(@Request() req: AuthenticatedRequest) {
    return this.documentService.getDocumentsSharedWithProfessional(
      req.user.sub,
    );
  }

  @Get('models')
  @Roles([Role.PROFESSIONAL])
  @ApiOperation({
    summary: 'Get document models (optionally filtered by category)',
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'List of document models' })
  async getModels(@Query('category') category?: string) {
    return this.documentService.getModels(category);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(
    @Request() req: AuthenticatedRequest,

    @Query('id') id: string,
  ) {
    return this.documentService.deleteDocument(id, req.user.sub);
  }
}
