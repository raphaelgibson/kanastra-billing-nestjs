import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoicesService],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should generate an invoice', async () => {
    const record = { name: 'John Doe', debtAmount: 1000.0 };
    const result = await service.generateInvoice(record);
    expect(result).toContain('Invoice generated to John Doe');
  });
});
