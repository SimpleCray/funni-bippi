import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import type { SessionData } from '../types';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const sessionId = client.handshake?.auth?.sessionId as string | undefined;
    if (!sessionId) {
      throw new WsException('Missing sessionId');
    }

    if (!client.data.userId) {
      const raw = await this.redis.get(`session:${sessionId}`);
      if (!raw) {
        throw new WsException('Invalid session');
      }
      const session = JSON.parse(raw) as SessionData;
      client.data.userId = session.userId;
      client.data.sessionId = sessionId;
    }

    return true;
  }
}
