import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Billings } from '../src/billings/billings.entity';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('Billings (e2e)', () => {
  let app: INestApplication;
  let billingsRepository: Repository<Billings>;
  let kafkaClient: ClientKafka;

  const mockCsvData = `name,governmentId,email,debtAmount,debtDueDate,debtId\nJohn Doe,12345678900,johndoe@kanastra.com.br,1000.00,2025-01-01,1adb6ccf-ff16-467f-bea7-5f05d494280f`;
  const mockInvalidCsvData = 'invalid\ndata';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: getRepositoryToken(Billings),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            emit: jest.fn().mockImplementation(() => of(undefined)),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    billingsRepository = moduleFixture.get<Repository<Billings>>(
      getRepositoryToken(Billings),
    );
    kafkaClient = moduleFixture.get<ClientKafka>('KAFKA_CLIENT');
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a CSV file and process it by emitting generate.invoice event', async () => {
    const fileBuffer = Buffer.from(mockCsvData, 'utf-8');

    jest.spyOn(billingsRepository, 'save').mockResolvedValue({} as any);
    const emitSpy = jest
      .spyOn(kafkaClient, 'emit')
      .mockImplementation(() => of(undefined));

    const response = await request(app.getHttpServer())
      .post('/billings/upload')
      .attach('file', fileBuffer, 'test.csv')
      .expect(201);

    expect(response.body.message).toBe('Arquivo processado com sucesso');
    expect(emitSpy).toHaveBeenCalledWith(
      'generate.invoice',
      expect.objectContaining({
        debtAmount: '1000.00',
        debtDueDate: '2025-01-01',
        debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
        email: 'johndoe@kanastra.com.br',
        governmentId: '12345678900',
        name: 'John Doe',
      }),
    );
  });

  it('should throw an error if the file is invalid', async () => {
    const invalidFileBuffer = Buffer.from(mockInvalidCsvData, 'utf-8');

    const response = await request(app.getHttpServer())
      .post('/billings/upload')
      .attach('file', invalidFileBuffer, 'invalid.csv')
      .expect(400);

    expect(response.body.message).toBe(
      'Invalid CSV format: Missing required columns.',
    );
  });
});
