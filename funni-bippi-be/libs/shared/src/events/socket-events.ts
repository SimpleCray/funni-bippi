/**
 * Socket.IO event names — single source of truth on the backend.
 *
 * Never hardcode an event string in a gateway/service. Import from here so
 * the name is defined once. The frontend keeps its own mirror copy
 * (`funni-bippi-fe/lib/socketEvents.ts`) — keep the two in sync.
 *
 * Strings that appear in BOTH directions (e.g. `chat:message`) share one key.
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
