import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom } from './entities/chat-room.entity';
import { RedisService } from 'src/shared/redis/redis.service';

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
        createdBy: new Types.ObjectId(userId),
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
      const chatRoom = await this.redisService.getOrSet<ChatRoom | null>(`chatroom:${id}`, async () => {
        return await this.chatroomModel.findById(id);
      });
      if (!chatRoom) throw new NotFoundException('ChatRoom not found');

      // ✅ Authorization Check AFTER cache retrieval
      const isOwner = chatRoom.createdBy.toString() === userId;
      const isMember = chatRoom.members?.some((m) => m.toString() === userId);

      if (!isOwner && !isMember) {
        throw new ForbiddenException('You are not authorized to view this chat room');
      }

      return chatRoom;
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
      if (existChatRoom.createdBy.toString() !== userId) throw new ForbiddenException(
        'You are not authorized to update this chat room'
      )
      const chatRoom = await this.chatroomModel.findOneAndUpdate({ _id: id }, updateChatRoomDto, { returnDocument: 'after' });
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
      if (existChatRoom.createdBy.toString() !== userId) throw new ForbiddenException(
        'You are not authorized to update this chat room'
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

  // join room
  async joinRoom(roomId: string, userId: string) {
    try {
      const room = await this.chatroomModel.findById(roomId);
      if (!room || !room.active) throw new NotFoundException('ChatRoom not found');
      if (room.createdBy.toString() === userId) throw new ForbiddenException('You cannot join your own chat room');
      const alreadyMember = room.members.find(member => member.toString() === userId);
      if (alreadyMember) throw new ForbiddenException('You are already a member of this chat room');
      if (room.members.length >= room.maxMembers) throw new ForbiddenException('ChatRoom is full');
      room.members.push(new Types.ObjectId(userId));
      await room.save();
      await Promise.all([
        this.redisService.del(`chatroom:${roomId}`),
        this.redisService.del(`chatrooms:${room.createdBy.toString()}`), // owner ka list cache
      ]);
      return room;
    } catch (error) {
      throw error;
    }
  }

  async leaveRoom(roomId: string, userId: string) {
    try {
      const room = await this.chatroomModel.findById(roomId);
      if (!room || !room.active) throw new NotFoundException('ChatRoom not found');
      const wasMember = room.members.some(member => member.toString() === userId);
      if (!wasMember) throw new ForbiddenException('You are not a member of this chat room');
      room.members = room.members.filter(member => member.toString() !== userId);
      await room.save();
      await Promise.all([
        this.redisService.del(`chatroom:${roomId}`),
        this.redisService.del(`chatrooms:${room.createdBy.toString()}`), // owner ka list cache
      ]);
      return room;
    } catch (error) {
      throw error;
    }
  }

}