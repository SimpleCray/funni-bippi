import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const sessionId = client.handshake?.auth?.sessionId;
    if (!sessionId) {
      throw new WsException('Missing sessionId');
    }
    return true;
  }
}
