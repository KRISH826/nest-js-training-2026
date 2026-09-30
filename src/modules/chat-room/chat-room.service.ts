import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    private readonly redisService: RedisService,
  ) { }
  async create(
    createChatRoomDto: CreateChatRoomDto,
    userId: string,
    avatar?: { public_id: string; url: string },
  ) {
    try {
      const existChatRoom = await this.chatroomModel.findOne({
        name: createChatRoomDto.name,
      });
      if (existChatRoom) {
        throw new ConflictException('ChatRoom already exists');
      }
      if (
        !createChatRoomDto.name ||
        !createChatRoomDto.description ||
        !createChatRoomDto.maxMembers
      ) {
        throw new Error('All fields are required');
      }
      const chatRoom = await this.chatroomModel.create({
        ...createChatRoomDto,
        members: [new Types.ObjectId(userId)],
        ...(avatar && { avatar }),
        createdBy: new Types.ObjectId(userId),
      });
      await this.redisService.del(`chatrooms:${userId}`);
      return chatRoom;
    } catch (error) {
      throw error;
    }
  }

  async findAll(userId: string) {
    try {
      const cacheKey = `chatrooms:${userId}`;
      const cachedChatRooms = await this.redisService.getOrSet<ChatRoom[]>(
        cacheKey,
        async () => {
          const chatRooms = await this.chatroomModel
            .find({
              active: true,
              $or: [{ createdBy: userId }, { members: userId }],
            })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'fname lname email avatar')
            .lean();
          return chatRooms;
        },
      );
      return cachedChatRooms;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const chatRoom = await this.redisService.getOrSet<ChatRoom | null>(
        `chatroom:${id}`,
        async () => {
          return await this.chatroomModel.findById(id);
        },
      );
      if (!chatRoom) throw new NotFoundException('ChatRoom not found');

      // ✅ Authorization Check AFTER cache retrieval
      const isOwner = chatRoom.createdBy.toString() === userId;
      const isMember = chatRoom.members?.some((m) => m.toString() === userId);

      if (!isOwner && !isMember) {
        throw new ForbiddenException(
          'You are not authorized to view this chat room',
        );
      }

      return chatRoom;
    } catch (error) {
      throw error;
    }
  }

  async findAllPublic(userId: string) {
    try {
      const cacheKey = `chatrooms:public:${userId}`;
      const cachedChatRooms = await this.redisService.getOrSet<ChatRoom[]>(
        cacheKey,
        async () => {
          const chatRooms = await this.chatroomModel
            .find({
              active: true,
              $nor: [{ createdBy: userId }, { members: userId }],
            })
            .sort({ createdAt: -1 })
            .populate({
              path: 'createdBy',
              select: 'fname lname email avatar',
            });
          return chatRooms;
        },
      );
      return cachedChatRooms;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateChatRoomDto: UpdateChatRoomDto,
    userId: string,
  ) {
    try {
      const existChatRoom = await this.chatroomModel.findOne({ _id: id });
      if (!existChatRoom) {
        throw new Error('ChatRoom not found');
      }
      if (existChatRoom.createdBy.toString() !== userId)
        throw new ForbiddenException(
          'You are not authorized to update this chat room',
        );
      const chatRoom = await this.chatroomModel.findOneAndUpdate(
        { _id: id },
        updateChatRoomDto,
        { returnDocument: 'after' },
      );
      await Promise.all([
        this.redisService.del(`chatroom:${id}`),
        this.redisService.del(`chatrooms:${userId}`),
      ]);
      return chatRoom;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    try {
      const existChatRoom = await this.chatroomModel.findOne({ _id: id });
      if (!existChatRoom) {
        throw new Error('ChatRoom not found');
      }
      if (existChatRoom.createdBy.toString() !== userId)
        throw new ForbiddenException(
          'You are not authorized to update this chat room',
        );
      const chatRoom = await this.chatroomModel.findOneAndDelete({ _id: id });
      await Promise.all([
        this.redisService.del(`chatroom:${id}`),
        this.redisService.del(`chatrooms:${userId}`),
      ]);
      return chatRoom;
    } catch (error) {
      throw error;
    }
  }

  // join room
  async joinRoom(roomId: string, userId: string) {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const roomMeta = await this.chatroomModel.findById(roomId, 'createdBy members maxMembers active');
      if (!roomMeta || !roomMeta.active) {
        throw new NotFoundException('ChatRoom not found or inactive');
      }
      if (roomMeta.createdBy.toString() === userId) {
        throw new ForbiddenException('You cannot join your own chat room');
      }
      const updateRoom = await this.chatroomModel.findOneAndUpdate({
        _id: roomId,
        active: true,
        members: { $ne: userObjectId }, $expr: { $lt: [{ $size: '$members' }, '$maxMembers'] },
      }, {
        $addToSet: { members: userObjectId },
      },
        {
          returnDocument: 'after'
        }
      )
      if (!updateRoom) {
        const existing = await this.chatroomModel.findById(roomId, 'members maxMembers');
        if (!existing) throw new NotFoundException('ChatRoom not found');

        const isMember = existing.members.some((m) => m.toString() === userId);
        if (isMember) {
          throw new ForbiddenException('You are already a member of this chat room');
        }
        if (existing.members.length >= existing.maxMembers) {
          throw new ForbiddenException('ChatRoom is full');
        }
        throw new Error('Failed to join room');
      }
      await Promise.all([
        this.redisService.del(`chatroom:${roomId}`),
        this.redisService.del(`chatrooms:${userId}`),
        this.redisService.del(`chatrooms:${roomMeta.createdBy.toString()}`), // owner ka list cache
        this.redisService.delPattern('chatrooms:public:*'),
      ]);
      return updateRoom;
    } catch (error) {
      throw error;
    }
  }

  async leaveRoom(roomId: string, userId: string) {
    try {
      const room = await this.chatroomModel.findById(roomId);
      const userObjectId = new Types.ObjectId(userId)
      if (!room || !room.active)
        throw new NotFoundException('ChatRoom not found');
      const wasMember = room.members.some(
        (member) => member.toString() === userId,
      );
      if (!wasMember)
        throw new ForbiddenException('You are not a member of this chat room');
      const upadetdroom = await this.chatroomModel.findOneAndDelete(
        {
          _id: roomId,
          members: userObjectId
        }, {
        $pull: { members: userObjectId },
        returnDocument: 'after'
      }
      )
      if (!upadetdroom) {
        throw new Error('Failed to leave room');
      }
      await Promise.all([
        this.redisService.del(`chatroom:${roomId}`),
        this.redisService.del(`chatrooms:${userId}`),
        this.redisService.del(`chatrooms:${room.createdBy.toString()}`), // owner ka list cache
        this.redisService.delPattern('chatrooms:public:*'),
      ]);
      return upadetdroom;
    } catch (error) {
      throw error;
    }
  }
}
