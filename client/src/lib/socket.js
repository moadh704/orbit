import { io } from 'socket.io-client'

let socket = null

// Dev → local API. Production same-origin `/` (single Render service).
// Split deploy: set VITE_SOCKET_URL=https://your-api.onrender.com
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.DEV ? 'http://localhost:8080' : '/')

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionDelay: 1000,
      reconnectionAttempts: 8,
      transports: ['websocket', 'polling']
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
