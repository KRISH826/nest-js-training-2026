import { Module } from '@nestjs/common';
import { ChatStreamGateway } from './chat-stream.gateway';
import { ChatModule } from 'src/modules/chat/chat.module';

@Module({
  imports: [ChatModule],
  providers: [ChatStreamGateway],
  exports: [ChatStreamGateway],
})
export class ChatStreamModule {}
