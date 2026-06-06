import { io } from 'socket.io-client'

const socket = io(process.env.NEXT_PUBLIC_BE_URL ?? 'http://localhost:3001', {
  transports: ['websocket'],
  autoConnect: false,
})

export default socket
