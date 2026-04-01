import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket) return socket;
  socket = io(
    import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
    {
      auth: { token },
      transports: ['websocket'],
    }
  );
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
