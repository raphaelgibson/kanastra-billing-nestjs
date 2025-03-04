import { Test, TestingModule } from '@nestjs/testing';
import { EmailsService } from './emails.service';

describe('EmailsService', () => {
  let service: EmailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailsService],
    }).compile();

    service = module.get<EmailsService>(EmailsService);
  });

  it('should send an e-mail', async () => {
    const result = await service.sendEmail('johndoe@kanastra.com.br', 'any_invoice');
    expect(result).toContain('E-mail sent to johndoe@kanastra.com.br: any_invoice');
  });
});
