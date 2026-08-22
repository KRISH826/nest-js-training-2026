import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomController } from './chat-room.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from './entities/chat-room.entity';

@Module({
  controllers: [ChatRoomController],
  providers: [ChatRoomService],
  imports: [
      MongooseModule.forFeature([
        { name: ChatRoom.name, schema: ChatRoomSchema },
      ]),
    ],
})
export class ChatRoomModule {}
