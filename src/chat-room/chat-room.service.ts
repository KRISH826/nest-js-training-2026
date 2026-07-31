import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom } from './entities/chat-room.entity';
import { RedisService } from 'src/redis/redis.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel(ChatRoom.name) private chatroomModel: Model<ChatRoom>,
    private readonly redisService: RedisService
  ) { }
  async create(createChatRoomDto: CreateChatRoomDto, userId: string) {
    try {
      const existChatRoom = await this.chatroomModel.findOne({ name: createChatRoomDto.name });
      if (existChatRoom) {
        throw new ConflictException(
          'ChatRoom already exists',
        );
      }
      if (!createChatRoomDto.name || !createChatRoomDto.description || !createChatRoomDto.maxMembers) {
        throw new Error('All fields are required');
      }
      const chatRoom = await this.chatroomModel.create({
        ...createChatRoomDto,
        createdBy: userId
      });
      await this.redisService.del(`chatrooms:${userId}`);
      return chatRoom;
    } catch (error) {
      throw error
    }
  }

  async findAll(userId: string) {
    try {
      const cacheKey = `chatrooms:${userId}`;
      const cachedChatRooms = await this.redisService.getOrSet<ChatRoom[]>(cacheKey, async () => {
        const chatRooms = await this.chatroomModel.find({ createdBy: userId }).lean();
        return chatRooms;
      })
      return cachedChatRooms
    } catch (error) {
      throw error
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const cacheKey = `chatroom:${id}`;
      const cachedChatRoom = await this.redisService.getOrSet<ChatRoom | null>(cacheKey, async () => {
        const chatRoom = await this.chatroomModel.findById(id);
        if(!chatRoom) throw new NotFoundException('ChatRoom not found');
        if(chatRoom.createdBy.toString() !== userId) throw new ForbiddenException(
          'You are not authorized to view this chat room'
        )
        return chatRoom;
      })
      return cachedChatRoom;
    } catch (error) {
      throw error
    }
  }

  async update(id: string, updateChatRoomDto: UpdateChatRoomDto, userId: string) {
    try {
      const existChatRoom = await this.chatroomModel.findOne({ _id: id });
      if (!existChatRoom) {
        throw new Error('ChatRoom not found');
      }
      if (existChatRoom.createdBy.toString() !== userId) throw new Error(
        'You are not authorized to update this chat room'
      )
      const chatRoom = await this.chatroomModel.findOneAndUpdate({ _id: id }, updateChatRoomDto, { new: true });
      await Promise.all([
        this.redisService.del(`chatroom:${id}`),
        this.redisService.del(`chatrooms:${userId}`),
      ]);
      return chatRoom;
    } catch (error) {
      throw error
    }
  }

  async remove(id: string, userId: string) {
    try {
      const existChatRoom = await this.chatroomModel.findOne({ _id: id });
      if (!existChatRoom) {
        throw new Error('ChatRoom not found');
      }
      if (existChatRoom.createdBy.toString() !== userId) throw new Error(
        'You are not authorized to delete this chat room'
      )
      const chatRoom = await this.chatroomModel.findOneAndDelete({ _id: id });
      await Promise.all([
        this.redisService.del(`chatroom:${id}`),
        this.redisService.del(`chatrooms:${userId}`),
      ])
      return chatRoom;
    } catch (error) {
      throw error
    }
  }
}
