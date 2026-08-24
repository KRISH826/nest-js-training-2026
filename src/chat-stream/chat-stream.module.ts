import { Module } from '@nestjs/common';
import { ChatStreamGateway } from './chat-stream.gateway';
import { ChatModule } from 'src/modules/chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from 'src/modules/chat-room/entities/chat-room.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/modules/auth/constants';

@Module({
  imports: [
    ChatModule,
    JwtModule.register({
      secret: jwtConstants.accessSecret,
    }),
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  providers: [ChatStreamGateway],
  exports: [ChatStreamGateway],
})
export class ChatStreamModule { }
