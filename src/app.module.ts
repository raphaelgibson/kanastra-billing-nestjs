import { Module } from '@nestjs/common';
import { InvoicesModule } from './invoices/invoices.module';
import { EmailsModule } from './emails/emails.module';
import { BillingsModule } from './billings/billings.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { env } from './env';
import { Billings } from './billings/billings.entity';
import { AppController } from './app.controller';

let dbConfig: TypeOrmModuleOptions;

if (env.NODE_ENV === 'test') {
  dbConfig = {
    type: 'sqlite',
    database: ':memory:',
    entities: [Billings],
    synchronize: true,
  };
} else {
  dbConfig = {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    entities: [Billings],
    synchronize: env.NODE_ENV === 'dev',
  };
}

@Module({
  imports: [
    InvoicesModule,
    EmailsModule,
    BillingsModule,
    TypeOrmModule.forRoot(dbConfig),
  ],
  controllers: [AppController],
})
export class AppModule {}
