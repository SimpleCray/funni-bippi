import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { KafkaTopics, GatewayBroadcastPayload } from '@app/shared'
import { ChatGateway } from './chat.gateway'

@Controller()
export class GatewayBroadcastController {
  constructor(private readonly chatGateway: ChatGateway) {}

  @EventPattern(KafkaTopics.GATEWAY_BROADCAST)
  handleBroadcast(@Payload() data: GatewayBroadcastPayload) {
    this.chatGateway.handleBroadcast(data)
  }
}
