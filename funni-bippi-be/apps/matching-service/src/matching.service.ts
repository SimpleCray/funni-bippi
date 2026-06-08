import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { RedisService, KafkaTopics, makeStranger } from '@app/shared';
import type { Gender, QueueEntry, MatchFoundPayload } from '@app/shared';
import { v4 as uuid } from 'uuid';

const QUEUES: Record<Gender, string> = {
  everyone: 'queue:everyone',
  male: 'queue:male',
  female: 'queue:female',
};

const MATCH_TIMEOUT_MS = 30_000;

@Injectable()
export class MatchingService implements OnModuleInit {
  private readonly logger = new Logger(MatchingService.name);
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private readonly redis: RedisService,
    @Inject('KAFKA_CLIENT') private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafka.connect();
  }

  async joinQueue(entry: {
    userId: string;
    socketId: string;
    gender: Gender;
  }): Promise<void> {
    const { userId, socketId, gender } = entry;
    const payload: QueueEntry = {
      userId,
      socketId,
      gender,
      joinedAt: Date.now(),
    };
    await this.redis.lpush(QUEUES[gender], JSON.stringify(payload));
    this.logger.log(`User ${userId} joined queue:${gender}`);

    const match = await this.tryMatch(payload);
    if (!match) {
      const timer = setTimeout(
        () => this.onTimeout(userId, socketId),
        MATCH_TIMEOUT_MS,
      );
      this.timeouts.set(userId, timer);
    }
  }

  async leaveQueue(userId: string): Promise<void> {
    const timer = this.timeouts.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.timeouts.delete(userId);
    }
    for (const queue of Object.values(QUEUES)) {
      const entries = await this.redis.lrange(queue, 0, -1);
      for (const raw of entries) {
        const e = JSON.parse(raw) as QueueEntry;
        if (e.userId === userId) {
          await this.redis.lrem(queue, 1, raw);
          return;
        }
      }
    }
  }

  private async tryMatch(joiner: QueueEntry): Promise<boolean> {
    const searchQueues = this.getSearchQueues(joiner.gender);

    for (const qKey of searchQueues) {
      const entries = await this.redis.lrange(qKey, 0, -1);
      for (const raw of entries) {
        const candidate = JSON.parse(raw) as QueueEntry;
        if (candidate.userId === joiner.userId) continue;

        await this.redis.lrem(qKey, 1, raw);
        await this.removeFromQueue(joiner.userId, joiner.gender);

        clearTimeout(this.timeouts.get(candidate.userId));
        this.timeouts.delete(candidate.userId);
        clearTimeout(this.timeouts.get(joiner.userId));
        this.timeouts.delete(joiner.userId);

        await this.createMatch(joiner, candidate);
        return true;
      }
    }
    return false;
  }

  private getSearchQueues(gender: Gender): string[] {
    if (gender === 'everyone') {
      return [QUEUES.everyone, QUEUES.male, QUEUES.female];
    }
    return [QUEUES[gender], QUEUES.everyone];
  }

  private async removeFromQueue(userId: string, gender: Gender): Promise<void> {
    const entries = await this.redis.lrange(QUEUES[gender], 0, -1);
    for (const raw of entries) {
      const e = JSON.parse(raw) as QueueEntry;
      if (e.userId === userId) {
        await this.redis.lrem(QUEUES[gender], 1, raw);
        return;
      }
    }
  }

  private async createMatch(
    user1: QueueEntry,
    user2: QueueEntry,
  ): Promise<void> {
    const roomId = uuid();
    const strangerForUser1 = makeStranger(user2.gender);
    const strangerForUser2 = makeStranger(user1.gender);

    const payload: MatchFoundPayload = {
      roomId,
      user1: { userId: user1.userId, socketId: user1.socketId },
      user2: { userId: user2.userId, socketId: user2.socketId },
      strangerForUser1,
      strangerForUser2,
    };

    this.kafka.emit(KafkaTopics.MATCH_FOUND, payload);
    this.logger.log(
      `Match created: room ${roomId} (${user1.userId} ↔ ${user2.userId})`,
    );
  }

  private onTimeout(userId: string, socketId: string): void {
    this.timeouts.delete(userId);
    this.kafka.emit(KafkaTopics.GATEWAY_BROADCAST, {
      type: 'emit-to-socket',
      socketIds: [socketId],
      event: 'error:no_match',
      data: { reason: 'No match found. Try again!' },
    });
    this.logger.log(`Timeout for user ${userId}`);
  }
}
