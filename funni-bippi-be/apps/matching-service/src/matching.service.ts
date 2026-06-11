import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { RedisService, KafkaTopics, makeStranger } from '@app/shared';
import type { Gender, Interest, QueueEntry, MatchFoundPayload } from '@app/shared';
import { v4 as uuid } from 'uuid';

const QUEUES: Record<Interest, string> = {
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
    interest: Interest;
  }): Promise<void> {
    const { userId, socketId, gender, interest } = entry;
    const payload: QueueEntry = {
      userId,
      socketId,
      gender,
      interest,
      joinedAt: Date.now(),
    };
    await this.redis.lpush(QUEUES[interest], JSON.stringify(payload));
    this.logger.log(`User ${userId} joined queue:${interest}`);

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
    const searchQueues = this.getSearchQueues(joiner.interest);

    for (const qKey of searchQueues) {
      const entries = await this.redis.lrange(qKey, 0, -1);
      for (const raw of entries) {
        const candidate = JSON.parse(raw) as QueueEntry;
        if (candidate.userId === joiner.userId) continue;

        // Atomically verify the candidate still exists before removing both users
        const candidateStillInQueue = await this.redis
          .lrange(qKey, 0, -1)
          .then((list) => list.some((entry) => entry === raw));

        if (!candidateStillInQueue) {
          // Race condition: candidate was already removed by another tryMatch
          this.logger.debug(
            `Candidate ${candidate.userId} already removed from queue`,
          );
          continue;
        }

        await this.redis.lrem(qKey, 1, raw);
        await this.removeFromQueue(joiner.userId, joiner.interest);

        clearTimeout(this.timeouts.get(candidate.userId));
        this.timeouts.delete(candidate.userId);
        clearTimeout(this.timeouts.get(joiner.userId));
        this.timeouts.delete(joiner.userId);

        this.logger.log(`Match found: ${joiner.userId} ↔ ${candidate.userId}`);
        this.createMatch(joiner, candidate);
        return true;
      }
    }
    return false;
  }

  private getSearchQueues(interest: Interest): string[] {
    if (interest === 'everyone') {
      return [QUEUES.everyone, QUEUES.male, QUEUES.female];
    }
    return [QUEUES[interest], QUEUES.everyone];
  }

  private async removeFromQueue(userId: string, interest: Interest): Promise<void> {
    const entries = await this.redis.lrange(QUEUES[interest], 0, -1);
    for (const raw of entries) {
      const e = JSON.parse(raw) as QueueEntry;
      if (e.userId === userId) {
        await this.redis.lrem(QUEUES[interest], 1, raw);
        this.logger.debug(`Removed user ${userId} from queue:${interest}`);
        return;
      }
    }
    // User not found in queue (may have already been removed by concurrent tryMatch)
    this.logger.debug(
      `User ${userId} not found in queue:${interest} (already removed?)`,
    );
  }

  private createMatch(user1: QueueEntry, user2: QueueEntry): void {
    const roomId = uuid();
    const strangerForUser1 = makeStranger(user2.gender, user2.interest);
    const strangerForUser2 = makeStranger(user1.gender, user1.interest);

    const payload: MatchFoundPayload = {
      roomId,
      user1: { userId: user1.userId, socketId: user1.socketId },
      user2: { userId: user2.userId, socketId: user2.socketId },
      strangerForUser1,
      strangerForUser2,
    };

    this.kafka.emit(KafkaTopics.MATCH_FOUND, payload);
    this.logger.log(
      `Match created: room ${roomId} (${user1.userId} ↔ ${user2.userId}) | Stranger1: ${strangerForUser1.name} | Stranger2: ${strangerForUser2.name}`,
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
