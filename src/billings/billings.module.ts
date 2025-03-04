import { Module } from '@nestjs/common';
import { BillingsController } from './billings.controller';
import { EmailsService } from './../emails/emails.service';
import { InvoicesService } from './../invoices/invoices.service';
import { CsvParserService } from './../utils/csv-parser.service';
import { Billing } from './billing.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingsService } from './billings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Billing])],
  controllers: [BillingsController],
  providers: [
    BillingsService,
    CsvParserService,
    EmailsService,
    InvoicesService
  ],
})
export class BillingsModule {}
