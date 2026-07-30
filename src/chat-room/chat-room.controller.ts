import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('chat-room')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createChatRoomDto: CreateChatRoomDto, @Req() req: Request) {
    const userId = req['user'].id;
    const chatRoom = await this.chatRoomService.create(createChatRoomDto, userId);
    return {
      data: chatRoom,
      message: 'ChatRoom created successfully',
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Req() req: Request) {
    const userId = req['user'].id;
    const chatRooms = await this.chatRoomService.findAll(userId);
    return {
      data: chatRooms,
      message: 'ChatRooms found successfully',
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].id;
    const chatRoom = await this.chatRoomService.findOne(id, userId);
    return {
      data: chatRoom,
      message: 'ChatRoom found successfully',
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateChatRoomDto: UpdateChatRoomDto, @Req() req: Request) {
    const userId = req['user'].id;
    const chatRoom = await this.chatRoomService.update(id, updateChatRoomDto, userId);
    return {
      data: chatRoom,
      message: 'ChatRoom updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].id;
    const chatRoom = await this.chatRoomService.remove(id, userId);
    return {
      data: chatRoom,
      message: 'ChatRoom deleted successfully',
    };
  }
}
