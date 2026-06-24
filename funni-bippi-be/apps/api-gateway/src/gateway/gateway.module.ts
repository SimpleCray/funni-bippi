import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT } from '@app/shared';
import { ChatGateway } from './chat.gateway';
import { GatewayBroadcastController } from './gateway-broadcast.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: KAFKA_CLIENT,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'api-gateway-producer',
            brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
          },
          producer: {},
        },
      },
    ]),
  ],
  providers: [ChatGateway],
  controllers: [GatewayBroadcastController],
  exports: [ChatGateway],
})
export class GatewayModule {}
