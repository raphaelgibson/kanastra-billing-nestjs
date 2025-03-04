import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailsService {
  async sendEmail(email: string, invoice: string): Promise<string> {
    return `E-mail sent to ${email}: ${invoice}`
  }
}
