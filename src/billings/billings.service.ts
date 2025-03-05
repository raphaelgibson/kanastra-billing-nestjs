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
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async processRecords(records: BillingRecord[]): Promise<void> {
    if (records.length === 0) return;

    const chunkSize = 10000;

    for (let i = 0; i < records.length; i += chunkSize) {
      console.log(i);
      console.log(i);
      console.log(i);
      const chunk = records.slice(i, i + chunkSize);
      const chunkDebtIds = chunk.map((record) => record.debtId);

      const existingRecords = await this.billingsRepo.find({
        select: ['debtId'],
        where: { debtId: In(chunkDebtIds) },
      });

      const existingIds = new Set(existingRecords.map((r) => r.debtId));

      const newRecords = chunk.filter(
        (record) => !existingIds.has(record.debtId),
      );

      for (const record of newRecords) {
        this.kafkaClient.emit('generate.invoice', record);
      }
    }
  }
}
