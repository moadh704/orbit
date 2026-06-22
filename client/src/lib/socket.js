import { io } from 'socket.io-client'

let socket = null

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:8080' : '/'

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })
  }
  return socket
}

export function connectSocket(token) {
  const s = getSocket()
  s.auth = { token }
  s.connect()
  return s
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
