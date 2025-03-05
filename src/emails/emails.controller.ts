import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { EmailsService } from "./emails.service";

type SendEmailPayload = {
  email: string;
  invoice: string;
}

@Controller()
export class EmailsController {
  private readonly logger = new Logger(EmailsController.name);

  constructor(private readonly emailsService: EmailsService) {}

  @MessagePattern('email_sending')
  async handleEmailSending(@Payload() data: SendEmailPayload) {
    this.logger.log(`Received email_sending event: ${JSON.stringify(data)}`);
    const sendEmailResponse = await this.emailsService.sendEmail(data.email, data.invoice);
    this.logger.log(sendEmailResponse);
  }
}
