import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, KafkaContext, Payload } from "@nestjs/microservices";
import { EmailsService } from "./emails.service";

type SendEmailPayload = {
  email: string;
  invoice: string;
}

@Controller()
export class EmailsController {
  private readonly logger = new Logger(EmailsController.name);

  constructor(private readonly emailsService: EmailsService) {}

  @EventPattern('send.email')
  async handleEmailSending(@Payload() data: SendEmailPayload, @Ctx() context: KafkaContext) {
    this.logger.log(`Received email_sending event: ${JSON.stringify(data)}`);
    const sendEmailResponse = await this.emailsService.sendEmail(data.email, data.invoice);
    this.logger.log(sendEmailResponse);
    await context.getConsumer().commitOffsets([
      { topic: 'send.email', partition: 0, offset: context.getMessage().offset },
    ]);
  }
}
