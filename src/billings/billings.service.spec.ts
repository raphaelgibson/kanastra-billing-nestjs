import { Test, TestingModule } from '@nestjs/testing';
import { BillingRecord, BillingsService } from './billings.service';
import { EmailsService } from './../emails/emails.service';
import { InvoicesService } from './../invoices/invoices.service';
import { Repository } from 'typeorm';
import { Billing } from './billing.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('BillingsService', () => {
  let service: BillingsService;
  let billingRepo: Repository<Billing>;
  let emailsService: EmailsService;
  let invoicesService: InvoicesService;

  function mockRecord(): BillingRecord {
    return {
      name: 'John Doe',
      governmentId: '12345678900',
      email: 'johndoe@kanastra.com.br',
      debtAmount: 1000.00,
      debtDueDate: new Date('2025-01-01'),
      debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingsService,
        {
          provide: getRepositoryToken(Billing),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: EmailsService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: InvoicesService,
          useValue: {
            generateInvoice: jest.fn().mockResolvedValue('Invoice generated'),
          },
        },
      ],
    }).compile();

    service = module.get<BillingsService>(BillingsService);
    billingRepo = module.get<Repository<Billing>>(getRepositoryToken(Billing));
    emailsService = module.get<EmailsService>(EmailsService);
    invoicesService = module.get<InvoicesService>(InvoicesService);
  });

  it('should process a new record and call InvoicesService and EmailsService', async () => {
    const record = mockRecord();
    jest.spyOn(billingRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(billingRepo, 'save').mockResolvedValue(record as any);

    await service.processRecords([record]);

    expect(invoicesService.generateInvoice).toHaveBeenCalledWith(record);
    expect(emailsService.sendEmail).toHaveBeenCalledWith(record.email, 'Invoice generated');
    expect(billingRepo.save).toHaveBeenCalledWith(record);
  });

  it('should not process records already processed', async () => {
    const record = mockRecord();

    jest.spyOn(billingRepo, 'findOne').mockResolvedValue(record as any);

    await service.processRecords([record]);

    expect(invoicesService.generateInvoice).not.toHaveBeenCalled();
    expect(emailsService.sendEmail).not.toHaveBeenCalled();
    expect(billingRepo.save).not.toHaveBeenCalled();
  });

  it('should catch errors while processing records', async () => {
    const record = mockRecord()

    jest.spyOn(billingRepo, 'findOne').mockRejectedValue(new Error('Database error'));

    await expect(service.processRecords([record])).rejects.toThrow('Database error');
  });
});
