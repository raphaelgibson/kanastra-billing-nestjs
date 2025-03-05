import { Module } from '@nestjs/common';
import { InvoicesModule } from './invoices/invoices.module';
import { EmailsModule } from './emails/emails.module';
import { BillingsModule } from './billings/billings.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { env } from './env';
import { Billing } from './billings/billing.entity';

let dbConfig: TypeOrmModuleOptions

if (env.NODE_ENV === 'test' || env.NODE_ENV === 'dev') {
  dbConfig = {
    type: 'sqlite',
    database: ':memory:',
    entities: [Billing],
    synchronize: true
  }
} else {
  dbConfig = {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    entities: [Billing]
  }
}

@Module({
  imports: [
    InvoicesModule,
    EmailsModule,
    BillingsModule,
    TypeOrmModule.forRoot(dbConfig)
  ]
})
export class AppModule {}
