import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const sessionId = client.handshake?.auth?.sessionId as string | undefined;
    if (!sessionId) {
      throw new WsException('Missing sessionId');
    }
    return true;
  }
}
