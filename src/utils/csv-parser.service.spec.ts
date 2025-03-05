import { Test, TestingModule } from '@nestjs/testing';
import { CsvParserService } from './csv-parser.service';

describe('CsvParserService', () => {
  let service: CsvParserService;
  const mockCsvData = `name,governmentId,email,debtAmount,debtDueDate,debtId\nJohn Doe,12345678900,johndoe@kanastra.com.br,1000.00,2025-01-01,1adb6ccf-ff16-467f-bea7-5f05d494280f`;
  const mockInvalidCsvData = 'invalid\ndata';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [CsvParserService],
    }).compile();

    service = moduleFixture.get<CsvParserService>(CsvParserService);
  });

  it('should parse a valid CSV and return the correct records', async () => {
    const fileBuffer = Buffer.from(mockCsvData);
    const result = await service.parseCsv(fileBuffer);

    expect(result).toEqual([
      {
        name: 'John Doe',
        governmentId: '12345678900',
        email: 'johndoe@kanastra.com.br',
        debtAmount: '1000.00',
        debtDueDate: '2025-01-01',
        debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
      },
    ]);
  });

  it('should throw an error if the CSV file is invalid', async () => {
    const invalidFileBuffer = Buffer.from(mockInvalidCsvData);
    await expect(service.parseCsv(invalidFileBuffer))
      .rejects.toThrow('Invalid CSV format: Missing required columns.');
  });
});
