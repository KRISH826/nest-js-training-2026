import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { jwtConstants } from 'src/auth/constants';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class ChatStreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers.authorization?.split(' ')[1] || this.extractCookieToken(client.handshake.headers.cookie);

      if(!token) {
        console.log(`[Ws Authorization] No token provided for client ${client.id} -- missing token`);
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.accessSecret!,
      });
      client.data.user = payload;
      console.log(`[Ws Authorization] Client ${client.id} connected with user ${payload.email}`);
    } catch (error) {
      client.disconnect();
      console.log(`[Ws Authorization] Client ${client.id} disconnected due to invalid token`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[Ws Authorization] Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string }
  ) {
    const {roomId} = payload;

    const user = client.data.user;
    if(!roomId) {
      client.emit('error', { message: 'Room ID is required' });
    }
    await client.join(roomId);
    console.log(`[Ws Authorization] User ${user.email} joined room ${roomId}`);
    this.server.to(roomId).emit('roomNotice', {
      user: user.email,
      message: `${user.email} joined the room`,
      timestamp: new Date().toISOString(),
    });

    return {
      status: 'success',
      message: `Joined room ${roomId}`,
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string }
  ) {
    const {roomId} = payload;

    await client.leave(roomId);
    const user = client.data.user;
    console.log(`[Ws Authorization] User ${user.email} left room ${roomId}`);

    this.server.to(roomId).emit('roomNotice', {
      user: user.email,
      message: `${user.email} left the room`,
      timestamp: new Date().toISOString(),
    });
    return {
      status: 'success',
      message: `Left room ${roomId}`,
    };
  }


  private extractCookieToken(cookieHeader?: string): string | undefined {
    if (!cookieHeader) return undefined;
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => {
        const [key, ...v] = c.split('=');
        return [key.trim(), v.join('=')];
      }),
    );
    return cookies['access_token'];
  }
}
