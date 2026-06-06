import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ClientKafka } from '@nestjs/microservices'
import { RedisService, KafkaTopics } from '@app/shared'
import type { MatchFoundPayload, MessagePayload, RoomData, GatewayBroadcastPayload } from '@app/shared'

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name)

  constructor(
    private readonly redis: RedisService,
    @Inject('KAFKA_CLIENT') private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafka.connect()
  }

  async handleMatchFound(payload: MatchFoundPayload): Promise<void> {
    const { roomId, user1, user2, strangerForUser1, strangerForUser2 } = payload

    const room: RoomData = {
      roomId,
      user1Id: user1.userId,
      user1SocketId: user1.socketId,
      user2Id: user2.userId,
      user2SocketId: user2.socketId,
      createdAt: Date.now(),
      status: 'active',
    }
    await this.redis.hset(`room:${roomId}`, {
      ...room,
      createdAt: String(room.createdAt),
    })
    await this.redis.set(`userRoom:${user1.userId}`, roomId)
    await this.redis.set(`userRoom:${user2.userId}`, roomId)

    this.broadcast({ type: 'join-room', socketIds: [user1.socketId, user2.socketId], roomId })

    this.broadcast({
      type: 'emit-to-socket',
      socketIds: [user1.socketId],
      event: 'match:found',
      data: { roomId, stranger: strangerForUser1 },
    })
    this.broadcast({
      type: 'emit-to-socket',
      socketIds: [user2.socketId],
      event: 'match:found',
      data: { roomId, stranger: strangerForUser2 },
    })

    this.logger.log(`Room ${roomId} created`)
  }

  async handleMessage(payload: MessagePayload): Promise<void> {
    const room = await this.redis.hgetall(`room:${payload.roomId}`)
    if (!room || room.status !== 'active') return

    this.broadcast({
      type: 'emit-to-room',
      roomId: payload.roomId,
      event: 'chat:message',
      data: {
        message: {
          id: payload.messageId,
          from: payload.fromUserId,
          text: payload.text,
          time: new Date(payload.timestamp).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
        },
      },
    })
  }

  async handleImage(payload: MessagePayload): Promise<void> {
    const room = await this.redis.hgetall(`room:${payload.roomId}`)
    if (!room || room.status !== 'active') return

    this.broadcast({
      type: 'emit-to-room',
      roomId: payload.roomId,
      event: 'chat:image',
      data: {
        imageUrl: payload.imageUrl,
        time: new Date(payload.timestamp).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
    })
  }

  async handleUserLeft(data: {
    userId: string
    socketId: string
    roomId?: string
    reason?: string
  }): Promise<void> {
    const roomId = data.roomId ?? (await this.redis.get(`userRoom:${data.userId}`))
    if (!roomId) return

    const room = await this.redis.hgetall(`room:${roomId}`)
    if (!room) return

    await this.redis.hset(`room:${roomId}`, { status: 'ended' })
    await this.redis.del(`userRoom:${data.userId}`)

    const partnerSocketId =
      room.user1SocketId === data.socketId ? room.user2SocketId : room.user1SocketId
    const partnerId = room.user1Id === data.userId ? room.user2Id : room.user1Id

    if (partnerSocketId) {
      this.broadcast({
        type: 'emit-to-socket',
        socketIds: [partnerSocketId],
        event: 'chat:stranger_left',
        data: {},
      })
    }
    await this.redis.del(`userRoom:${partnerId}`)
    this.logger.log(`Room ${roomId} ended (user ${data.userId} left)`)
  }

  private broadcast(payload: GatewayBroadcastPayload): void {
    this.kafka.emit(KafkaTopics.GATEWAY_BROADCAST, payload)
  }
}
