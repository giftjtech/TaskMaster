import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from '../config/jwt.config';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: jwtConfig.secret,
        });
        client.data.userId = payload.sub;
        client.join(`user:${payload.sub}`);
      } else {
        console.warn('WebSocket connection rejected: No token provided');
        client.disconnect();
      }
    } catch (error) {
      console.error('WebSocket connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.data.userId}`);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket) {
    if (client.data.userId) {
      client.join(`user:${client.data.userId}`);
    }
  }

  async sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  async sendTaskUpdate(taskId: string, update: any) {
    this.server.emit('task:update', { taskId, update });
  }
}

