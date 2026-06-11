import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KafkaTopics } from '@app/shared';
import type { Gender, Interest } from '@app/shared';
import { MatchingService } from './matching.service';

@Controller()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @EventPattern(KafkaTopics.USER_JOIN_QUEUE)
  async handleJoinQueue(
    @Payload()
    data: {
      userId: string;
      socketId: string;
      gender: Gender;
      interest: Interest;
    },
  ) {
    await this.matchingService.joinQueue(data);
  }

  @EventPattern(KafkaTopics.USER_LEAVE_QUEUE)
  async handleLeaveQueue(
    @Payload() data: { userId: string; socketId: string },
  ) {
    await this.matchingService.leaveQueue(data.userId);
  }
}
