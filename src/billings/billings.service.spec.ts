import { Test, TestingModule } from '@nestjs/testing';
import { BillingRecord, BillingsService } from './billings.service';
import { Repository } from 'typeorm';
import { Billings } from './billings.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientKafka } from '@nestjs/microservices';

describe('BillingsService', () => {
  let service: BillingsService;
  let billingsRepo: Repository<Billings>;
  let kafkaClient: ClientKafka;

  function mockRecord(): BillingRecord {
    return {
      name: 'John Doe',
      governmentId: '12345678900',
      email: 'johndoe@kanastra.com.br',
      debtAmount: 1000.0,
      debtDueDate: new Date('2025-01-01'),
      debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
    };
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        BillingsService,
        {
          provide: getRepositoryToken(Billings),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: 'KAFKA_CLIENT',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleFixture.get<BillingsService>(BillingsService);
    billingsRepo = moduleFixture.get<Repository<Billings>>(
      getRepositoryToken(Billings),
    );
    kafkaClient = moduleFixture.get<ClientKafka>('KAFKA_CLIENT');
  });

  it('should publish generate.invoice event for new records', async () => {
    const record = mockRecord();
    jest.spyOn(billingsRepo, 'find').mockResolvedValue([]);

    await service.processRecords([record]);

    expect(kafkaClient.emit).toHaveBeenCalledWith('generate.invoice', record);
  });

  it('should not publish event for already processed records', async () => {
    const record = mockRecord();
    jest
      .spyOn(billingsRepo, 'find')
      .mockResolvedValue([{ id: 123, ...record }]);

    await service.processRecords([record]);

    expect(kafkaClient.emit).not.toHaveBeenCalled();
  });

  it('should not catch errors while processing records', async () => {
    const record = mockRecord();
    jest
      .spyOn(billingsRepo, 'find')
      .mockRejectedValue(new Error('Database error'));

    await expect(service.processRecords([record])).rejects.toThrow(
      'Database error',
    );
  });

  it('should not publish event when no new records are found', async () => {
    jest.spyOn(billingsRepo, 'find').mockResolvedValue([]);

    await service.processRecords([]);

    expect(kafkaClient.emit).not.toHaveBeenCalled();
  });
});
