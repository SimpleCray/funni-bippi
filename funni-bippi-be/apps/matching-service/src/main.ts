import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { MatchingModule } from './matching.module'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MatchingModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'matching-service',
          brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
        },
        consumer: { groupId: 'matching-consumer' },
      },
    },
  )
  await app.listen()
  console.log('Matching Service listening on Kafka')
}
bootstrap()
