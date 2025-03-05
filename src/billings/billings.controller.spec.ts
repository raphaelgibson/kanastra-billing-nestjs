import { Test, TestingModule } from '@nestjs/testing';
import { BillingsController } from './billings.controller';
import { BillingsService } from './billings.service';
import { CsvParseError, CsvParserService } from '../utils/csv-parser.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('BillingsController', () => {
  let controller: BillingsController;
  let csvParserService: CsvParserService;
  let billingsService: BillingsService

  const mockFile = {
    buffer: Buffer.from(
      'name,governmentId,email,debtAmount,debtDueDate,debtId\nJohn Doe,12345678900,johndoe@kanastra.com.br,1000.00,2025-01-01,1adb6ccf-ff16-467f-bea7-5f05d494280f',
    ),
  };

  const mockRecord = {
    name: 'John Doe',
    governmentId: '12345678900',
    email: 'johndoe@kanastra.com.br',
    debtAmount: 1000.00,
    debtDueDate: new Date('2025-01-01'),
    debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingsController],
      providers: [
        {
          provide: CsvParserService,
          useValue: {
            parseCsv: jest.fn().mockResolvedValue([mockRecord]),
          },
        },
        {
          provide: BillingsService,
          useValue: {
            processRecords: jest.fn().mockResolvedValue(undefined),
          }
        },
      ],
    }).compile();

    controller = module.get<BillingsController>(BillingsController);
    csvParserService = module.get<CsvParserService>(CsvParserService);
    billingsService = module.get<BillingsService>(BillingsService);
  });

  it('should call BillingService with correct params', async () => {
    await controller.uploadFile(mockFile as Express.Multer.File);

    expect(csvParserService.parseCsv).toHaveBeenCalledWith(mockFile.buffer);
    expect(billingsService.processRecords).toHaveBeenCalledWith([mockRecord]);
  });

  it('should return a success message when the file is processed successfully', async () => {
    const response = await controller.uploadFile(mockFile as Express.Multer.File);
    expect(response).toEqual({ message: 'Arquivo processado com sucesso' });
  });

  it('should throw BAD_REQUEST when CsvParseError occurs', async () => {
    jest.spyOn(csvParserService, 'parseCsv').mockRejectedValue(new CsvParseError('Invalid CSV format'));

    await expect(controller.uploadFile(mockFile as Express.Multer.File)).rejects.toThrow(
      new HttpException('Invalid CSV format', HttpStatus.BAD_REQUEST),
    );
  });

  it('should throw INTERNAL_SERVER_ERROR on unexpected errors', async () => {
    jest.spyOn(billingsService, 'processRecords').mockRejectedValue(new Error('Unexpected error'));

    await expect(controller.uploadFile(mockFile as Express.Multer.File)).rejects.toThrow(
      new HttpException('An unexpected error has ocurred processing the file', HttpStatus.INTERNAL_SERVER_ERROR),
    );
  });
});
