import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImageOptions, multerPdfOptions } from './utils/multer.config';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', multerImageOptions))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFileMetadata(file, 'IMAGE');
  }
  @Post('pdf')
  @UseInterceptors(FileInterceptor('file', multerPdfOptions))
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.saveFileMetadata(file, 'PDF');
  }
}
