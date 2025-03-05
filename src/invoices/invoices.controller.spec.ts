import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Logger } from '@nestjs/common';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let invoicesService: InvoicesService;
  let logSpy: jest.SpyInstance;

  const mockInvoice = {
    name: 'John Doe',
    governmentId: '12345678900',
    email: 'johndoe@kanastra.com.br',
    debtAmount: 1000.0,
    debtDueDate: new Date('2025-01-01'),
    debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoicesService,
          useValue: {
            generateInvoice: jest.fn().mockResolvedValue('Invoice #12345'),
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleFixture.get<InvoicesController>(InvoicesController);
    invoicesService = moduleFixture.get<InvoicesService>(InvoicesService);

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  it('should call InvoicesService.generateInvoice() and logs with correct params', async () => {
    await controller.handleInvoiceGeneration(mockInvoice);

    expect(invoicesService.generateInvoice).toHaveBeenCalledWith(mockInvoice);
    expect(logSpy).toHaveBeenCalledWith(
      `Received message to generate invoice for ${mockInvoice.name}`,
    );
    expect(logSpy).toHaveBeenCalledWith(`Invoice generated: Invoice #12345.`);
  });

  it('should not catch errors', async () => {
    jest
      .spyOn(invoicesService, 'generateInvoice')
      .mockRejectedValue(new Error('Service Error'));

    await expect(
      controller.handleInvoiceGeneration(mockInvoice),
    ).rejects.toThrow('Service Error');
  });
});
