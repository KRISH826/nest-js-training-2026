import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('chat-room')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createChatRoomDto: CreateChatRoomDto) {
    const chatRoom = await this.chatRoomService.create(createChatRoomDto);
    return {
      data: chatRoom,
      message: 'ChatRoom created successfully',
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    const chatRooms = await this.chatRoomService.findAll();
    return {
      data: chatRooms,
      message: 'ChatRooms found successfully',
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    const chatRoom = await this.chatRoomService.findOne(id);
    return {
      data: chatRoom,
      message: 'ChatRoom found successfully',
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateChatRoomDto: UpdateChatRoomDto) {
    const chatRoom = await this.chatRoomService.update(id, updateChatRoomDto);
    return {
      data: chatRoom,
      message: 'ChatRoom updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    const chatRoom = await this.chatRoomService.remove(id);
    return {
      data: chatRoom,
      message: 'ChatRoom deleted successfully',
    };
  }
}
