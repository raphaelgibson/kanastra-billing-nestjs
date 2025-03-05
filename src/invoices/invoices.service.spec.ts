import { Test, TestingModule } from '@nestjs/testing';
import { BillingRecord, InvoicesService } from './invoices.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Billing } from '../billings/billing.entity';
import { Repository } from 'typeorm';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let billingRepo: Repository<Billing>;

  const mockRecord: BillingRecord = {
    name: 'John Doe',
    governmentId: '12345678900',
    email: 'johndoe@kanastra.com.br',
    debtAmount: 1000.00,
    debtDueDate: new Date('2025-01-01'),
    debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Billing),
          useValue: {
            save: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    billingRepo = module.get<Repository<Billing>>(getRepositoryToken(Billing));
  });

  it('should generate an invoice and save it to the database', async () => {
    const result = await service.generateInvoice(mockRecord);

    expect(result).toBe(`Invoice generated to John Doe - Value: R$ 1000`);
    expect(billingRepo.save).toHaveBeenCalledWith({
      name: mockRecord.name,
      governmentId: mockRecord.governmentId,
      email: mockRecord.email,
      debtAmount: mockRecord.debtAmount,
      debtDueDate: mockRecord.debtDueDate,
      debtId: mockRecord.debtId,
    });
  });

  it('should handle errors when saving to database', async () => {
    jest.spyOn(billingRepo, 'save').mockRejectedValue(new Error('Database error'));

    await expect(service.generateInvoice(mockRecord)).rejects.toThrow('Database error');
  });
});
