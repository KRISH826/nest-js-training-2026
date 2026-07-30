import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';

@Controller('chat-room')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  async create(@Body() createChatRoomDto: CreateChatRoomDto) {
    const chatRoom = await this.chatRoomService.create(createChatRoomDto);
    return chatRoom;
  }

  @Get()
  async findAll() {
    const chatRooms = await this.chatRoomService.findAll();
    return chatRooms;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const chatRoom = await this.chatRoomService.findOne(id);
    return chatRoom;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatRoomDto: UpdateChatRoomDto) {
    const chatRoom = this.chatRoomService.update(id, updateChatRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatRoomService.remove(id);
  }
}
