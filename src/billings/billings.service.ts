import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Billing } from './billing.entity';
import { Repository } from 'typeorm';
import { EmailsService } from './../emails/emails.service';
import { InvoicesService } from './../invoices/invoices.service';

export type BillingRecord = {
  name: string;
  governmentId: string;
  email: string;
  debtAmount: number;
  debtDueDate: Date;
  debtId: string;
};

@Injectable()
export class BillingsService {
  constructor(
    @InjectRepository(Billing) private billingRepo: Repository<Billing>,
    private readonly emailsService: EmailsService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async processRecords(records: BillingRecord[]): Promise<void> {
    for (const record of records) {
      const exists = await this.billingRepo.findOne({ where: { debtId: record.debtId } });

      if (exists) {
        continue
      }

      const invoice = await this.invoicesService.generateInvoice(record);
      await this.emailsService.sendEmail(record.email, invoice);
      await this.billingRepo.save(record);
    }
  }
}
