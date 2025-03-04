import * as csvParser from 'csv-parser'
import { Injectable } from '@nestjs/common'
import { Readable } from 'node:stream';

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvParseError';
  }
}

@Injectable()
export class CsvParserService {
  async parseCsv(fileBuffer: Buffer): Promise<any[]> {
    const requiredColumns = ['name', 'governmentId', 'email', 'debtAmount', 'debtDueDate', 'debtId'];
    const stream = Readable.from(fileBuffer)
    const parser = stream.pipe(csvParser({
      strict: true
    }))

    return new Promise((resolve, reject) => {
      const records: any[] = [];
      let isValid = true

      parser.on('data', data => {
        if (!requiredColumns.every((column) => column in data)) {
          isValid = false;
          stream.destroy();
          return reject(new CsvParseError('Invalid CSV format: Missing required columns.'));
        }

        records.push(data)
      });

      parser.on('end', () => {
        if (isValid) resolve(records)
      })

      parser.on('error', (error) => reject(new CsvParseError(`Error parsing CSV: ${error.message}`)));
    });
  }
}
