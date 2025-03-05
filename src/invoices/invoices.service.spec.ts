import { Test, TestingModule } from '@nestjs/testing';
import { BillingRecord, InvoicesService } from './invoices.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Billings } from '../billings/billings.entity';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let billingsRepo: Repository<Billings>;
  let kafkaClient: ClientKafka;

  const mockRecord: BillingRecord = {
    name: 'John Doe',
    governmentId: '12345678900',
    email: 'johndoe@kanastra.com.br',
    debtAmount: 1000.00,
    debtDueDate: new Date('2025-01-01'),
    debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Billings),
          useValue: {
            save: jest.fn().mockResolvedValue(undefined),
            findOneBy: jest.fn().mockResolvedValue(null),
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

    service = moduleFixture.get<InvoicesService>(InvoicesService);
    billingsRepo = moduleFixture.get<Repository<Billings>>(getRepositoryToken(Billings));
    kafkaClient = moduleFixture.get<ClientKafka>('KAFKA_CLIENT');
  });

  it('should generate an invoice and save it to the database', async () => {
    const result = await service.generateInvoice(mockRecord);

    expect(result).toBe(`Invoice generated to John Doe - Value: R$ 1000`);
    expect(billingsRepo.save).toHaveBeenCalledWith({
      name: mockRecord.name,
      governmentId: mockRecord.governmentId,
      email: mockRecord.email,
      debtAmount: mockRecord.debtAmount,
      debtDueDate: mockRecord.debtDueDate,
      debtId: mockRecord.debtId,
    });
    expect(kafkaClient.emit).toHaveBeenCalledWith('send.email', {
      email: mockRecord.email,
      invoice: `Invoice generated to John Doe - Value: R$ 1000`,
    });
  });

  it('should not generate a new invoice if debtId already exists', async () => {
    jest.spyOn(billingsRepo, 'findOneBy').mockResolvedValueOnce({ id: 123, ...mockRecord });

    const result = await service.generateInvoice(mockRecord);

    expect(result).toBe(`Invoice already generated for John Doe`);
    expect(billingsRepo.save).not.toHaveBeenCalled();
    expect(kafkaClient.emit).not.toHaveBeenCalled();
  });

  it('should handle errors when saving to database', async () => {
    jest.spyOn(billingsRepo, 'save').mockRejectedValue(new Error('Database error'));

    await expect(service.generateInvoice(mockRecord)).rejects.toThrow('Database error');
    expect(kafkaClient.emit).not.toHaveBeenCalled();
  });
});
