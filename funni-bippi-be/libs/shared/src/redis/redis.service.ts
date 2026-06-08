import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: false,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });
    this.client.on('error', (err) =>
      this.logger.error('Redis error', err.message),
    );
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  get redis(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async hset(key: string, fields: Record<string, string>): Promise<void> {
    await this.client.hset(key, fields);
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    const data = await this.client.hgetall(key);
    return Object.keys(data).length ? data : null;
  }

  async lpush(key: string, value: string): Promise<void> {
    await this.client.lpush(key, value);
  }

  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  async lrem(key: string, count: number, value: string): Promise<void> {
    await this.client.lrem(key, count, value);
  }
}
