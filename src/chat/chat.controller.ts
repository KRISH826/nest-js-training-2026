import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto, @Req() req: Request) {
    const senderId = req['user'].sub;
    const chat = this.chatService.create(createChatDto, senderId);
    return {
      data: chat,
      message: "Chat created successfully"
    }
  }

  @Get("room/:chatRoomId")
  async findByRoom(
    @Param ('chatRoomId') chatRoomId: string,
    @Param ('limit') limit?: string,
    @Param ('before') before?: string
  ) {
    const messages = await this.chatService.findByRoom(
      chatRoomId,
      limit ? parseInt(limit, 10) : undefined,
      before
    )
    return {
      data: messages,
      message: "Messages found successfully"
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
