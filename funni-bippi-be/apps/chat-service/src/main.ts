import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ChatModule } from './chat.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'chat-service',
          brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
        },
        consumer: { groupId: 'chat-consumer' },
      },
    },
  );
  await app.listen();
  console.log('Chat Service listening on Kafka');
}
bootstrap();
