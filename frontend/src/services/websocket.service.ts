import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../utils/constants';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    // Don't create a new connection if one already exists
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    // Disconnect existing socket if it exists but isn't connected
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const websocketService = new WebSocketService();

