import { Test, TestingModule } from '@nestjs/testing';
import { BillingRecord, BillingsService } from './billings.service';
import { Repository } from 'typeorm';
import { Billing } from './billing.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';

describe('BillingsService', () => {
  let service: BillingsService;
  let billingRepo: Repository<Billing>;
  let kafkaClient: ClientProxy;

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
            find: jest.fn(),
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        }
      ],
    }).compile();

    service = module.get<BillingsService>(BillingsService);
    billingRepo = module.get<Repository<Billing>>(getRepositoryToken(Billing));
    kafkaClient = module.get<ClientProxy>('KAFKA_SERVICE');
  });

  it('should publish invoice_generation event for new records', async () => {
    const record = mockRecord();
    jest.spyOn(billingRepo, 'find').mockResolvedValue([]);

    await service.processRecords([record]);

    expect(kafkaClient.emit).toHaveBeenCalledWith('invoice_generation', record);
  });

  it('should not publish event for already processed records', async () => {
    const record = mockRecord();
    jest.spyOn(billingRepo, 'find').mockResolvedValue([{ id: 'any_id', ...record }]);

    await service.processRecords([record]);

    expect(kafkaClient.emit).not.toHaveBeenCalled();
  });

  it('should not catch errors while processing records', async () => {
    const record = mockRecord()
    jest.spyOn(billingRepo, 'find').mockRejectedValue(new Error('Database error'));

    await expect(service.processRecords([record])).rejects.toThrow('Database error');
  });

  it('should not publish event when no new records are found', async () => {
    jest.spyOn(billingRepo, 'find').mockResolvedValue([]);

    await service.processRecords([]);

    expect(kafkaClient.emit).not.toHaveBeenCalled();
  });
});
