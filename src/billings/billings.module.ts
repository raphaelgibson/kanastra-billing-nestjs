import { Module } from '@nestjs/common';
import { BillingsController } from './billings.controller';
import { EmailsService } from './../emails/emails.service';
import { InvoicesService } from './../invoices/invoices.service';
import { CsvParserService } from './../utils/csv-parser.service';
import { Billings } from './billings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingsService } from './billings.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'billings-api',
            brokers: ['kafka:9092'],
          },
        },
      },
    ]),
    TypeOrmModule.forFeature([Billings]),
  ],
  controllers: [BillingsController],
  providers: [
    BillingsService,
    CsvParserService,
    EmailsService,
    InvoicesService,
  ],
})
export class BillingsModule {}
