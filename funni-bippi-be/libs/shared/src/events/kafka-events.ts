export const KafkaTopics = {
  USER_JOIN_QUEUE: 'user.join-queue',
  USER_LEAVE_QUEUE: 'user.leave-queue',
  MATCH_FOUND: 'match.found',
  CHAT_MESSAGE: 'chat.message',
  CHAT_IMAGE: 'chat.image',
  CHAT_TYPING: 'chat.typing',
  CHAT_USER_LEFT: 'chat.user-left',
  IMAGE_UPLOADED: 'image.uploaded',
  GATEWAY_BROADCAST: 'gateway.broadcast',
} as const;

export type KafkaTopic = (typeof KafkaTopics)[keyof typeof KafkaTopics];
