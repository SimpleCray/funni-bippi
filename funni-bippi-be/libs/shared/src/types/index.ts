export type Gender = 'everyone' | 'male' | 'female'

export interface StrangerProfile {
  name: string
  gender: Gender
  grad: [string, string]
  glyph: string
}

export interface QueueEntry {
  userId: string
  socketId: string
  gender: Gender
  joinedAt: number
}

export interface RoomData {
  roomId: string
  user1Id: string
  user1SocketId: string
  user2Id: string
  user2SocketId: string
  createdAt: number
  status: 'active' | 'ended'
}

export interface SessionData {
  userId: string
  socketId: string | null
  gender: Gender
  createdAt: number
}

export interface MessagePayload {
  messageId: string
  roomId: string
  fromUserId: string
  fromSocketId?: string
  text?: string
  imageUrl?: string
  timestamp: number
}

export interface MatchFoundPayload {
  roomId: string
  user1: { userId: string; socketId: string }
  user2: { userId: string; socketId: string }
  strangerForUser1: StrangerProfile
  strangerForUser2: StrangerProfile
}

export interface GatewayBroadcastPayload {
  type: 'join-room' | 'emit-to-socket' | 'emit-to-room'
  roomId?: string
  socketIds?: string[]
  excludeSocketIds?: string[]
  event?: string
  data?: unknown
}
