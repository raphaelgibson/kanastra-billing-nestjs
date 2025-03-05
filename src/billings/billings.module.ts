import { Module } from '@nestjs/common';
import { BillingsController } from './billings.controller';
import { EmailsService } from './../emails/emails.service';
import { InvoicesService } from './../invoices/invoices.service';
import { CsvParserService } from './../utils/csv-parser.service';
import { Billings } from './billings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingsService } from './billings.service';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [TypeOrmModule.forFeature([Billings]), MessagingModule],
  controllers: [BillingsController],
  providers: [
    BillingsService,
    CsvParserService,
    EmailsService,
    InvoicesService
  ],
})
export class BillingsModule {}
