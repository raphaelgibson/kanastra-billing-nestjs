import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
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
  async uploadFile(@UploadedFile() file?: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
      }

      const result = await this.csvParserService.parseCsv(file.buffer);
      file.buffer = Buffer.alloc(0);
      await this.billingsService.processRecords(result);
      return { message: 'Arquivo processado com sucesso' };
    } catch (error) {
      if (error instanceof CsvParseError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      } else if (error.message === 'No file provided') {
        throw error;
      }

      console.error(error);

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
