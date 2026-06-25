export const BROADCAST_TYPES = {
  JOIN_ROOM: 'join-room',
  EMIT_TO_SOCKET: 'emit-to-socket',
  EMIT_TO_ROOM: 'emit-to-room',
} as const;

export type BroadcastType =
  (typeof BROADCAST_TYPES)[keyof typeof BROADCAST_TYPES];
