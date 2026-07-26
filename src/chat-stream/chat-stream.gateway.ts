import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatStreamGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log("hello new message")
    return 'Hello world!';
  }
}
