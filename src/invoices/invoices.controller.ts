import { Controller, Inject, Logger } from "@nestjs/common";
import { ClientProxy, EventPattern, Payload } from "@nestjs/microservices";
import { BillingRecord, InvoicesService } from "./invoices.service";

@Controller()
export class InvoicesController {
  private readonly logger = new Logger(InvoicesController.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly client: ClientProxy,
    private readonly invoicesService: InvoicesService,
  ) {}

  @EventPattern('generate.invoice')
  async handleInvoiceGeneration(@Payload() data: BillingRecord) {
    this.logger.log(`Received message to generate invoice for ${data.name}`);
    const invoice = await this.invoicesService.generateInvoice(data);
    this.logger.log(`Invoice generated: ${invoice}. Publishing email_sending event...`)
    this.client.emit('send.email', { email: data.email, invoice });
  }
}
