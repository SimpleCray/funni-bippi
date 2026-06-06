import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { KafkaTopics, MatchFoundPayload, MessagePayload } from '@app/shared'
import { ChatService } from './chat.service'

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @EventPattern(KafkaTopics.MATCH_FOUND)
  async handleMatchFound(@Payload() data: MatchFoundPayload) {
    await this.chatService.handleMatchFound(data)
  }

  @EventPattern(KafkaTopics.CHAT_MESSAGE)
  async handleMessage(@Payload() data: MessagePayload) {
    await this.chatService.handleMessage(data)
  }

  @EventPattern(KafkaTopics.CHAT_IMAGE)
  async handleImage(@Payload() data: MessagePayload) {
    await this.chatService.handleImage(data)
  }

  @EventPattern(KafkaTopics.CHAT_USER_LEFT)
  async handleUserLeft(
    @Payload() data: { userId: string; socketId: string; roomId?: string; reason?: string },
  ) {
    await this.chatService.handleUserLeft(data)
  }
}
