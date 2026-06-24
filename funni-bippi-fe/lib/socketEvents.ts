/**
 * Socket.IO event names — single source of truth on the frontend.
 *
 * Never hardcode an event string in a hook/component. Import from here.
 * This MIRRORS the backend's `funni-bippi-be/libs/shared/src/events/socket-events.ts`
 * (the two apps don't share code) — keep the two files in sync.
 */
export const SOCKET_EVENTS = {
  // ---- client → server ----
  USER_JOIN: 'user:join',
  USER_CANCEL: 'user:cancel',
  CHAT_NEXT: 'chat:next',
  CHAT_REPORT: 'chat:report',

  // ---- bidirectional (same name both ways) ----
  CHAT_MESSAGE: 'chat:message',
  CHAT_IMAGE: 'chat:image',
  CHAT_TYPING: 'chat:typing',
  CHAT_REACTION: 'chat:reaction',

  // ---- server → client ----
  MATCH_FOUND: 'match:found',
  CHAT_STRANGER_LEFT: 'chat:stranger_left',
  ERROR_NO_MATCH: 'error:no_match',
  ERROR_SERVER: 'error:server',

  // ---- socket.io built-in ----
  DISCONNECT: 'disconnect',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
