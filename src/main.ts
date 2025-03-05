import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');

  const invoiceMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'invoice-service',
        brokers: ['kafka:9092'],
      },
      consumer: {
        groupId: 'invoice-consumer-group',
        maxInFlightRequests: 1,
        retry: {
          retries: 0
        }
      },
    },
  });

  const mailMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'mail-service',
        brokers: ['kafka:9092'],
      },
      consumer: {
        groupId: 'mail-consumer-group',
        maxInFlightRequests: 1,
        retry: {
          retries: 0
        }
      },
    },
  });

  await invoiceMicroservice.listen();
  await mailMicroservice.listen();
}
bootstrap();
