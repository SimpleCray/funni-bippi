import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/shared';
import { v4 as uuid } from 'uuid';
import type { SessionData } from '@app/shared';

const SESSION_TTL = Number(process.env.SESSION_TTL_SECONDS ?? 86400);

@Injectable()
export class AuthService {
  constructor(private readonly redis: RedisService) {}

  async createSession(): Promise<{ sessionId: string; userId: string }> {
    const sessionId = uuid();
    const userId = uuid();
    const data: SessionData = {
      userId,
      socketId: null,
      gender: 'everyone',
      createdAt: Date.now(),
    };
    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify(data),
      SESSION_TTL,
    );
    return { sessionId, userId };
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.get(`session:${sessionId}`);
    return raw ? (JSON.parse(raw) as SessionData) : null;
  }

  async updateSocketId(sessionId: string, socketId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    session.socketId = socketId;
    await this.redis.set(
      `session:${sessionId}`,
      JSON.stringify(session),
      SESSION_TTL,
    );
    await this.redis.set(`socket:${socketId}`, sessionId, SESSION_TTL);
  }

  async removeSocket(socketId: string): Promise<string | null> {
    const sessionId = await this.redis.get(`socket:${socketId}`);
    if (sessionId) {
      await this.redis.del(`socket:${socketId}`);
    }
    return sessionId;
  }
}
