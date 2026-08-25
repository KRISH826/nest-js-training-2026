import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  SWAGGER_AUTH_NAME,
  SWAGGER_TAGS,
} from 'src/common/swagger/swagger.constants';
import {
  ApiCreateChatRoom,
  ApiFindAllChatRooms,
  ApiFindAllPublicChatRooms,
  ApiFindOneChatRoom,
  ApiUpdateChatRoom,
} from './chat-room.swagger';
import type { AuthenticatedRequest } from 'src/modules/auth/auth.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

@ApiTags(SWAGGER_TAGS.CHAT_ROOM)
@ApiBearerAuth(SWAGGER_AUTH_NAME)
@Controller('chat-room')
@UseGuards(AuthGuard)
export class ChatRoomController {
  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateChatRoom() // 👈 Clean custom decorator!
  async create(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: 'image/jpeg|image/png|image/jpg' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const userId = req.user.sub;
    let avatar: { public_id: string; url: string } | undefined = undefined;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'chat_room_avatars',
      );
      avatar = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }
    const chatRoom = await this.chatRoomService.create(
      createChatRoomDto,
      userId,
      avatar,
    );
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

  @Get('public')
  @HttpCode(HttpStatus.OK)
  @ApiFindAllPublicChatRooms()
  async findAllPublic(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRooms = await this.chatRoomService.findAllPublic(userId);
    return {
      data: chatRooms,
      message: 'Public ChatRooms found successfully',
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
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.OK)
  @ApiUpdateChatRoom()
  async update(
    @Param('id') id: string,
    @Body() updateChatRoomDto: UpdateChatRoomDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: 'image/jpeg|image/png|image/jpg' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const userId = req.user.sub;
    let newAvatar: { public_id: string; url: string } | undefined = undefined;

    if (file) {
      const existingChatRoom = await this.chatRoomService.findOne(id, userId);
      if (existingChatRoom.avatar?.public_id) {
        try {
          await this.cloudinaryService.deleteImage(
            existingChatRoom.avatar.public_id,
          );
        } catch (error) {
          console.log('Error deleting old avatar from Cloudinary:', error);
        }
      }
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'chat_room_avatars',
      );
      newAvatar = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    const chatRoom = await this.chatRoomService.update(
      id,
      {
        ...updateChatRoomDto,
        ...(newAvatar && { avatar: newAvatar }),
      },
      userId,
    );
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
      message: 'Joined Chat Room Successfully',
    };
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard)
  async leaveRoom(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const chatRoom = await this.chatRoomService.leaveRoom(id, userId);
    return {
      data: chatRoom,
      message: 'Left Chat Room Successfully',
    };
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
