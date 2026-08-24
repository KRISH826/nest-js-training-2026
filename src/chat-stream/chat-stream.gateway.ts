import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model, connect } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { jwtConstants } from 'src/modules/auth/constants';
import { ChatRoom } from 'src/modules/chat-room/entities/chat-room.entity';
import { ChatService } from 'src/modules/chat/chat.service';
import { RedisService } from 'src/shared/redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true, // Crucial for receiving HttpOnly cookies over WS
  },
})
export class ChatStreamGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatStreamGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
    @InjectModel(ChatRoom.name) private readonly chatRoomModel: Model<ChatRoom>,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1] ||
        this.extractCookieToken(client.handshake.headers.cookie);

      if (!token) {
        console.log(
          `[Ws Authorization] No token provided for client ${client.id} -- missing token`,
        );
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.accessSecret!,
      });
      client.data.user = payload;
      console.log(
        `[Ws Authorization] Client ${client.id} connected with user ${payload.email}`,
      );
    } catch (error) {
      client.disconnect();
      console.log(
        `[Ws Authorization] Client ${client.id} disconnected due to invalid token`,
      );
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[Ws Authorization] Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const { roomId } = payload;

    const user = client.data.user;
    if (!roomId) {
      client.emit('error', { message: 'Room ID is required' });
    }
    const room = await this.chatRoomModel.findById(roomId);
    if (!room) {
      client.emit('error', { message: 'Chat room not found' });
      return;
    }

    const isMember = room.createdBy.toString() === user.sub || room.members.some((m: any) => m.toString() === user.sub);
    if (!isMember) {
      client.emit('error', { message: 'You are not a member of this room' });
      return;
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
    };
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const { roomId } = payload;

    await client.leave(roomId);
    const user = client.data.user;
    console.log(`[Ws Authorization] User ${user.email} left room ${roomId}`);

    this.server.to(roomId).emit('roomNotice', {
      user: user.lname + " " + user.fname,
      message: `${user.lname + " " + user.fname} left the room`,
      timestamp: new Date().toISOString(),
    });
    return {
      status: 'success',
      message: `Left room ${roomId}`,
    };
  }

  @SubscribeMessage('chatMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatRoom: string; message: string; tempId?: string },
  ) {
    const { chatRoom, message, tempId } = payload;
    const user = client.data.user;

    if (!chatRoom || !message) {
      client.emit('error', { message: 'Room ID and message are required' });
      return;
    }

    const savedChat = await this.chatService.create(
      {
        chatRoom: chatRoom,
        message,
      },
      user.sub,
    );

    const chatData = {
      tempId,
      senderId: savedChat._id,
      sender: savedChat.sender,
      senderEmail: user.email,
      chatRoom: chatRoom,
      message: message,
      timestamp: new Date().toISOString(),
    };
    this.server.to(chatRoom).emit('newMessage', chatData);
    console.log(
      `[Ws Authorization] User ${user.email} sent message to room ${chatRoom}: ${message}`,
    );

    return {
      status: 'success',
      chatData,
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
