import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SWAGGER_AUTH_NAME, SWAGGER_TAGS } from 'src/common/swagger/swagger.constants';
import { ApiCreateChatRoom, ApiFindAllChatRooms, ApiFindOneChatRoom, ApiUpdateChatRoom } from './chat-room.swagger';
import type { AuthenticatedRequest } from 'src/auth/auth.types';

@ApiTags(SWAGGER_TAGS.CHAT_ROOM)
@ApiBearerAuth(SWAGGER_AUTH_NAME)
@Controller('chat-room')
@UseGuards(AuthGuard)
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateChatRoom() // 👈 Clean custom decorator!
  async create(@Body() createChatRoomDto: CreateChatRoomDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRoom = await this.chatRoomService.create(createChatRoomDto, userId);
    return {
      data: chatRoom,
      message: 'ChatRoom created successfully',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiFindAllChatRooms() // 👈 Clean custom decorator!
  async findAll(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRooms = await this.chatRoomService.findAll(userId);
    return {
      data: chatRooms,
      message: 'ChatRooms found successfully',
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiFindOneChatRoom()
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRoom = await this.chatRoomService.findOne(id, userId);
    return {
      data: chatRoom,
      message: 'ChatRoom found successfully',
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateChatRoom()

  async update(@Param('id') id: string, @Body() updateChatRoomDto: UpdateChatRoomDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRoom = await this.chatRoomService.update(id, updateChatRoomDto, userId);
    return {
      data: chatRoom,
      message: 'ChatRoom updated successfully',
    };
  }

  @Post(':id/join')
  @UseGuards(AuthGuard)
  async joinRoom(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRoom = await this.chatRoomService.joinRoom(id, userId);
    return {
      data: chatRoom,
      message: "Joined Chat Room Successfully"
    }
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard)
  async leaveRoom(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRoom = await this.chatRoomService.leaveRoom(id, userId);
    return {
      data: chatRoom,
      message: "Left Chat Room Successfully"
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRoom = await this.chatRoomService.remove(id, userId);
    return {
      data: chatRoom,
      message: 'ChatRoom deleted successfully',
    };
  }
}
