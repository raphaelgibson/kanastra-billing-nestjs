import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Billing } from '../src/billings/billing.entity';
import { Repository } from 'typeorm';

describe('BillingsController (e2e)', () => {
  let app: INestApplication;
  let billingRepository: Repository<Billing>

  const mockCsvData = `name,governmentId,email,debtAmount,debtDueDate,debtId\nJohn Doe,12345678900,johndoe@kanastra.com.br,1000.00,2025-01-01,1adb6ccf-ff16-467f-bea7-5f05d494280f`;
  const mockInvalidCsvData = 'invalid\ndata';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getRepositoryToken(Billing),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ]
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    billingRepository = moduleFixture.get<Repository<Billing>>(getRepositoryToken(Billing));
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should upload a CSV file and process it', async () => {
    const fileBuffer = Buffer.from(mockCsvData, 'utf-8');

    jest.spyOn(billingRepository, 'save').mockResolvedValue({} as any);

    const response = await request(app.getHttpServer())
      .post('/billings/upload')
      .attach('file', fileBuffer, 'test.csv')
      .expect(201);

    expect(response.body.message).toBe('Arquivo processado com sucesso');
    expect(billingRepository.save).toHaveBeenCalled();
  });

  it('should throw an error if the file is invalid', async () => {
    const invalidFileBuffer = Buffer.from(mockInvalidCsvData, 'utf-8');
    
    const response = await request(app.getHttpServer())
      .post('/billings/upload')
      .attach('file', invalidFileBuffer, 'invalid.csv')
      .expect(400);

    expect(response.body.message).toBe('Invalid CSV format: Missing required columns.');
  });
});
