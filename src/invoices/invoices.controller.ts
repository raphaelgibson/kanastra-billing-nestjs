import { Controller, Inject, Logger } from "@nestjs/common";
import { ClientKafka, Ctx, EventPattern, KafkaContext, Payload } from "@nestjs/microservices";
import { BillingRecord, InvoicesService } from "./invoices.service";

@Controller()
export class InvoicesController {
  private readonly logger = new Logger(InvoicesController.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly invoicesService: InvoicesService,
  ) {}

  @EventPattern('generate.invoice')
  async handleInvoiceGeneration(@Payload() data: BillingRecord, @Ctx() context: KafkaContext) {
    this.logger.log(`Received message to generate invoice for ${data.name}`);
    const invoice = await this.invoicesService.generateInvoice(data);
    this.logger.log(`Invoice generated: ${invoice}. Publishing email_sending event...`)
    this.kafkaClient.emit('send.email', { email: data.email, invoice });
    await context.getConsumer().commitOffsets([
      { topic: 'generate.invoice', partition: 0, offset: context.getMessage().offset },
    ]);
  }
}
