import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Billing } from './billing.entity';
import { In, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';

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
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientProxy
  ) {}

  async processRecords(records: BillingRecord[]): Promise<void> {
    if (records.length === 0) return

    const existingDebtIds = new Set(
      (await this.billingRepo.find({
        where: { debtId: In(records.map(record => record.debtId)) }
      })).map(record => record.debtId)
    )

    const newRecords = records.filter(record => !existingDebtIds.has(record.debtId))
    
    if (newRecords.length === 0) return

    newRecords.forEach(record => {
      this.kafkaClient.emit('invoice_generation', record)
    })
  }
}
