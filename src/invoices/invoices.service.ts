import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Billing } from '../billings/billing.entity';
import { Repository } from 'typeorm';

export type BillingRecord = {
  name: string;
  governmentId: string;
  email: string;
  debtAmount: number;
  debtDueDate: Date;
  debtId: string;
};

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Billing) private billingRepo: Repository<Billing>
  ) {}

  async generateInvoice(record: BillingRecord): Promise<string> {
    const invoice = `Invoice generated to ${record.name} - Value: R$ ${record.debtAmount}`;

    await this.billingRepo.save({
      name: record.name,
      governmentId: record.governmentId,
      email: record.email,
      debtAmount: record.debtAmount,
      debtDueDate: record.debtDueDate,
      debtId: record.debtId
    });

    return invoice;
  }
}
