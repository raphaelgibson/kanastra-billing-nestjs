import { Controller, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BillingsService } from './billings.service';
import { CsvParseError, CsvParserService } from '../utils/csv-parser.service';

@Controller('billings')
export class BillingsController {
  constructor(
    private readonly csvParserService: CsvParserService,
    private readonly billingsService: BillingsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.csvParserService.parseCsv(file.buffer);
      await this.billingsService.processRecords(result);
      return { message: 'Arquivo processado com sucesso' };
    } catch (error) {
      if (error instanceof CsvParseError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
      }
      
      throw new HttpException('An unexpected error has ocurred processing the file', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
