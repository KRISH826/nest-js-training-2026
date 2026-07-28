import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class ChatStreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly ROOM = 'Coders Lounge';

  @SubscribeMessage('joinRoom')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: string) {
    console.log(`${payload} is joining the room`);
    await client.join(this.ROOM);
    this.server.to(this.ROOM).emit('roomNotice', {
      username: payload,
      message: `${payload} has joined the room`,
    });
    console.log('Recived', payload);
  }

  @SubscribeMessage('messageList')
  async handleMessageList(@ConnectedSocket() client: Socket, @MessageBody() payload: string) {
    this.server.to(this.ROOM).emit('messageList', payload);
    console.log('Recived', payload);
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: string) {
    this.server.to(this.ROOM).emit('chatMessage', {
      username: client.id,
      message: payload
    });
    console.log(client.id ,":", payload);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: string) {
    console.log(`${payload} is leaving the room`);
    await client.leave(this.ROOM);
  }

  handleConnection(connect: any, ...args: any[]) {
    console.log(`hello new connection ${connect.id}`)
  }
  handleDisconnect(connect: any) {
    console.log(`hello new disconnection ${connect.id}`)
  }
}
