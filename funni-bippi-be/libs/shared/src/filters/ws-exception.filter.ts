import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../events/socket-events';

/**
 * Global WebSocket exception filter.
 *
 * Catches everything thrown from socket handlers (guards, ValidationPipe,
 * handler bodies) and emits a single, predictable `error:server` event to the
 * offending client instead of leaking Nest's raw `exception` payload.
 *
 * Shape sent to FE: { event, message }
 *   - event:   the socket event that triggered the error (or 'unknown')
 *   - message: human-readable reason
 */
@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ws = host.switchToWs();
    const client = ws.getClient<Socket>();
    const event = ws.getPattern?.() ?? 'unknown';

    let message = 'Internal server error';

    if (exception instanceof WsException) {
      const err = exception.getError();
      message =
        typeof err === 'string'
          ? err
          : ((err as { message?: string })?.message ?? message);
    } else if (exception instanceof Error) {
      // Validation pipe and others throw plain Errors — surface message, log stack
      message = exception.message || message;
    }

    this.logger.warn(
      `WS error on "${event}" (client ${client?.id}): ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (client?.connected) {
      client.emit(SOCKET_EVENTS.ERROR_SERVER, { event, message });
    }
  }
}
