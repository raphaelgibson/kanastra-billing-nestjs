import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Billings } from './billings.entity';
import { In, Repository } from 'typeorm';
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
export class BillingsService {
  constructor(
    @InjectRepository(Billings) private billingsRepo: Repository<Billings>,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka
  ) {}

  async processRecords(records: BillingRecord[]): Promise<void> {
    if (records.length === 0) return

    const existingDebtIds = new Set(
      (await this.billingsRepo.find({
        where: { debtId: In(records.map(record => record.debtId)) }
      })).map(record => record.debtId)
    )

    const newRecords = records.filter(record => !existingDebtIds.has(record.debtId))
    
    if (newRecords.length === 0) return

    newRecords.forEach(record => {
      this.kafkaClient.emit('generate.invoice', record)
    })
  }
}
