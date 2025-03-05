import { Test, TestingModule } from '@nestjs/testing';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { Logger } from '@nestjs/common';

describe('EmailsController', () => {
  let controller: EmailsController;
  let emailsService: EmailsService;
  let logSpy: jest.SpyInstance;

  const mockEmailsService = {
    sendEmail: jest.fn().mockResolvedValue('Email sent successfully'),
  };

  const mockPayload = {
    email: 'johndoe@kanastra.com.br',
    invoice: 'Invoice generated to John Doe - Value: R$ 1000',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EmailsController],
      providers: [
        {
          provide: EmailsService,
          useValue: mockEmailsService,
        },
      ],
    }).compile();

    controller = moduleFixture.get<EmailsController>(EmailsController);
    emailsService = moduleFixture.get<EmailsService>(EmailsService);

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  it('should call EmailsService.sendEmail() with correct params', async () => {
    await controller.handleEmailSending(mockPayload);

    expect(emailsService.sendEmail).toHaveBeenCalledWith(mockPayload.email, mockPayload.invoice);
  });

  it('should log the received event and the email response', async () => {
    await controller.handleEmailSending(mockPayload);

    expect(logSpy).toHaveBeenCalledWith(`Received email_sending event: ${JSON.stringify(mockPayload)}`);
    expect(logSpy).toHaveBeenCalledWith('Email sent successfully');
  });

  it('should handle errors when sending email', async () => {
    jest.spyOn(emailsService, 'sendEmail').mockRejectedValue(new Error('Email service down'));

    await expect(controller.handleEmailSending(mockPayload)).rejects.toThrow('Email service down');
  });
});
