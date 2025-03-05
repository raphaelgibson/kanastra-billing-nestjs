import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { ClientProxy } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let invoicesService: InvoicesService;
  let logSpy: jest.SpyInstance;
  let client: ClientProxy;

  const mockInvoice = {
    name: 'John Doe',
    governmentId: '12345678900',
    email: 'johndoe@kanastra.com.br',
    debtAmount: 1000.00,
    debtDueDate: new Date('2025-01-01'),
    debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    controller = module.get<InvoicesController>(InvoicesController);
    invoicesService = module.get<InvoicesService>(InvoicesService);
    client = module.get<ClientProxy>('KAFKA_SERVICE');

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  it('should process InvoicesService.generateInvoice() and emit email_sending event', async () => {
    await controller.handleInvoiceGeneration(mockInvoice);

    expect(invoicesService.generateInvoice).toHaveBeenCalledWith(mockInvoice);
    expect(client.emit).toHaveBeenCalledWith('email_sending', {
      email: mockInvoice.email,
      invoice: 'Invoice #12345',
    });
    
    expect(logSpy).toHaveBeenCalledWith(
      `Received message to generate invoice for ${mockInvoice.name}`,
    );
    expect(logSpy).toHaveBeenCalledWith(
      `Invoice generated: Invoice #12345. Publishing email_sending event...`,
    );
  });

  it('should not catch errors', async () => {
    jest.spyOn(invoicesService, 'generateInvoice').mockRejectedValue(new Error('Service Error'));

    await expect(controller.handleInvoiceGeneration(mockInvoice)).rejects.toThrow('Service Error');

    expect(client.emit).not.toHaveBeenCalled();
  });
});
