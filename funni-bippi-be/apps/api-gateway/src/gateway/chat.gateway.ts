import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
  Inject,
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Server, Socket } from 'socket.io';

interface SocketData {
  userId: string;
  sessionId: string;
}

type TypedSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  SocketData
>;

import {
  SessionGuard,
  JoinQueueDto,
  SendMessageDto,
  SendImageDto,
  TypingDto,
  LeaveRoomDto,
  ReportDto,
  KafkaTopics,
  GatewayBroadcastPayload,
} from '@app/shared';
import { AuthService } from '../auth/auth.service';
import { v4 as uuid } from 'uuid';

@WebSocketGateway({
  cors: {
    origin: process.env.FE_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafka: ClientKafka,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: TypedSocket) {
    const sessionId = client.handshake.auth?.sessionId as string;
    if (!sessionId) {
      client.disconnect();
      return;
    }
    const session = await this.authService.getSession(sessionId);
    if (!session) {
      client.disconnect();
      return;
    }
    await this.authService.updateSocketId(sessionId, client.id);
    client.data.userId = session.userId;
    client.data.sessionId = sessionId;
    this.logger.log(`Client connected: ${client.id} (user: ${session.userId})`);
  }

  async handleDisconnect(client: TypedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const sessionId = await this.authService.removeSocket(client.id);
    if (!sessionId) return;

    this.kafka.emit(KafkaTopics.CHAT_USER_LEFT, {
      userId: client.data.userId,
      socketId: client.id,
    });
  }

  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('user:join')
  handleJoinQueue(
    @ConnectedSocket() client: TypedSocket,
    @MessageBody() dto: JoinQueueDto,
  ) {
    this.kafka.emit(KafkaTopics.USER_JOIN_QUEUE, {
      userId: client.data.userId,
      socketId: client.id,
      gender: dto.gender,
    });
  }

  @UseGuards(SessionGuard)
  @SubscribeMessage('user:cancel')
  handleCancelQueue(@ConnectedSocket() client: TypedSocket) {
    this.kafka.emit(KafkaTopics.USER_LEAVE_QUEUE, {
      userId: client.data.userId,
      socketId: client.id,
    });
  }

  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('chat:message')
  handleMessage(
    @ConnectedSocket() client: TypedSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    this.kafka.emit(KafkaTopics.CHAT_MESSAGE, {
      roomId: dto.roomId,
      fromUserId: client.data.userId,
      fromSocketId: client.id,
      text: dto.text,
      messageId: uuid(),
      timestamp: Date.now(),
    });
  }

  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('chat:image')
  handleImage(
    @ConnectedSocket() client: TypedSocket,
    @MessageBody() dto: SendImageDto,
  ) {
    this.kafka.emit(KafkaTopics.CHAT_IMAGE, {
      roomId: dto.roomId,
      fromUserId: client.data.userId,
      fromSocketId: client.id,
      imageUrl: dto.imageUrl,
      messageId: uuid(),
      timestamp: Date.now(),
    });
  }

  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: TypedSocket,
    @MessageBody() dto: TypingDto,
  ) {
    client.to(dto.roomId).emit('chat:typing', { typing: dto.typing ?? true });
  }

  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('chat:next')
  handleNext(
    @ConnectedSocket() client: TypedSocket,
    @MessageBody() dto: LeaveRoomDto,
  ) {
    this.kafka.emit(KafkaTopics.CHAT_USER_LEFT, {
      userId: client.data.userId,
      socketId: client.id,
      roomId: dto.roomId,
      reason: 'next',
    });
  }

  @UseGuards(SessionGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage('chat:report')
  handleReport(
    @ConnectedSocket() client: TypedSocket,
    @MessageBody() dto: ReportDto,
  ) {
    this.kafka.emit(KafkaTopics.CHAT_USER_LEFT, {
      userId: client.data.userId,
      socketId: client.id,
      roomId: dto.roomId,
      reason: 'report',
    });
  }

  handleBroadcast(payload: GatewayBroadcastPayload) {
    if (payload.type === 'join-room' && payload.socketIds && payload.roomId) {
      for (const sid of payload.socketIds) {
        const sock = this.server.sockets.sockets.get(sid);
        if (sock) sock.join(payload.roomId);
      }
    } else if (
      payload.type === 'emit-to-socket' &&
      payload.socketIds &&
      payload.event
    ) {
      for (const sid of payload.socketIds) {
        this.server.to(sid).emit(payload.event, payload.data);
      }
    } else if (
      payload.type === 'emit-to-room' &&
      payload.roomId &&
      payload.event
    ) {
      const emitter = payload.excludeSocketIds?.length
        ? this.server.to(payload.roomId).except(payload.excludeSocketIds)
        : this.server.to(payload.roomId);
      emitter.emit(payload.event, payload.data);
    }
  }
}
