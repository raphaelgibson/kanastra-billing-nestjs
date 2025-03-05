import { Body, Controller, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BillingsService } from './billings.service';
import { CsvParseError, CsvParserService } from '../utils/csv-parser.service';
import * as multer from 'multer'

@Controller('billings')
export class BillingsController {
  constructor(
    private readonly csvParserService: CsvParserService,
    private readonly billingsService: BillingsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    // limits: { fileSize: 5 * 1024 * 1024 },  // Limite de 5MB
    // storage: multer.memoryStorage(),  // Armazenar o arquivo na memória
  }))
  async uploadFile(@UploadedFile() file?: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST)
      }

      const result = await this.csvParserService.parseCsv(file.buffer);
      await this.billingsService.processRecords(result);
      return { message: 'Arquivo processado com sucesso' };
    } catch (error) {
      if (error instanceof CsvParseError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
      } else if (error.message === 'No file provided') {
        throw error
      }
      
      throw new HttpException('An unexpected error has occurred processing the file', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
