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
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() username: string) {
    client.data.username = username;
    console.log(`${username} is joining the room`);
    await client.join(this.ROOM);
    this.server.to(this.ROOM).emit('roomNotice', {
      username: username,
      message: `${username} has joined the room`,
    });
    console.log('Recived', username);
  }

  @SubscribeMessage('messageList')
  async handleMessageList(@ConnectedSocket() client: Socket, @MessageBody() payload: string) {
    this.server.to(this.ROOM).emit('messageList', payload);
    console.log('Recived', payload);
  }

  @SubscribeMessage('chatMessage')
  async handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: string) {
    this.server.to(this.ROOM).emit('chatMessage', {
      username: client.data.username,
      message: payload
    });
    console.log(client.data.username ,":", payload);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: string) {
    console.log(`${payload} is leaving the room`);
    await client.leave(this.ROOM);
  }

  handleConnection(client: Socket, ...args: any[]) {
    const username = client.handshake.auth?.username;
    if(username) {
      client.data.username = username;
      client.join(this.ROOM);
      console.log(`${username} auto-joined on connect ${client.id}`);
    }
    console.log(`hello new connection ${client.id}`)
  }
  handleDisconnect(connect: any) {
    console.log(`hello new disconnection ${connect.id}`)
  }
}
