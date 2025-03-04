import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoicesService {
  async generateInvoice(record: any): Promise<string> {
    return `Invoice generated to ${record.name} - Value: R$ ${record.debtAmount}`;
  }
}
