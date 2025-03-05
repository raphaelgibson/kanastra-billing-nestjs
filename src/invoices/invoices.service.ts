import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Billings } from '../billings/billings.entity';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';

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
    @InjectRepository(Billings) private billingsRepo: Repository<Billings>,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka
  ) {}

  async generateInvoice(record: BillingRecord): Promise<string> {
    const existingDebtId = await this.billingsRepo.findOneBy({ debtId: record.debtId });

    if (existingDebtId) {
      return `Invoice already generated for ${record.name}`;
    }

    const invoice = `Invoice generated to ${record.name} - Value: R$ ${record.debtAmount}`;

    await this.billingsRepo.save({
      name: record.name,
      governmentId: record.governmentId,
      email: record.email,
      debtAmount: record.debtAmount,
      debtDueDate: record.debtDueDate,
      debtId: record.debtId
    });

    this.kafkaClient.emit('send.email', { email: record.email, invoice });

    return invoice;
  }
}
