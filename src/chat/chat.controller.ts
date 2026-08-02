import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post()
  async create(@Body() createChatDto: CreateChatDto, @Req() req: Request) {
    const senderId = req['user'].sub;
    const chat = await this.chatService.create(createChatDto, senderId);
    return {
      data: chat,
      message: "Chat created successfully"
    }
  }

  @Get("room/:chatRoomId")
  async findByRoom(
    @Param('chatRoomId') chatRoomId: string,
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('before') before?: string
  ) {
    const userId = req['user'].sub;
    const messages = await this.chatService.findByRoom(
      chatRoomId,
      userId,
      limit ? parseInt(limit, 10) : undefined,
      before
    )
    return {
      data: messages,
      message: "Messages found successfully",
      before: messages[messages.length - 1]?._id,
      hasMore: limit !== undefined && messages.length === parseInt(limit, 10),
      limit: limit ? parseInt(limit, 10) : undefined
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const chat = await this.chatService.findOne(id);
    return {
      data: chat,
      message: "Chat found successfully"
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto, @Req() req: Request) {
    const userId = req['user'].sub;
    const chat = await this.chatService.update(id, updateChatDto, userId);
    return {
      data: chat,
      message: "Chat updated successfully"
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].sub;
    const chat = await this.chatService.remove(id, userId);
    return {
      data: chat,
      message: "Chat deleted successfully"
    };
  }
}
