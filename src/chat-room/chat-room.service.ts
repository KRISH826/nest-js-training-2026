import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom } from './entities/chat-room.entity';

@Injectable()
export class ChatRoomService {
  constructor(@InjectModel(ChatRoom.name) private chatroomModel: Model<ChatRoom>) { }
  async create(createChatRoomDto: CreateChatRoomDto, userId: string) {
    try {
      const existChatRoom = await this.chatroomModel.findOne({ name: createChatRoomDto.name });
      if (existChatRoom) {
        throw new Error('ChatRoom already exists');
      }
      if(!createChatRoomDto.name || !createChatRoomDto.description || !createChatRoomDto.maxMembers) {
        throw new Error('All fields are required');
      }
      const chatRoom = await this.chatroomModel.create({
        ...createChatRoomDto,
        createdBy: userId
      });
      return chatRoom;
    } catch (error) {
      throw error
    }
  }

  async findAll(userId: string) {
    try {
      const chatRooms = await this.chatroomModel.find({ createdBy: userId });
      return chatRooms;
    } catch (error) {
      throw error
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const existCharRoom = await this.chatroomModel.findOne({ _id: id });
      if (!existCharRoom) {
        throw new Error('ChatRoom not found');
      }
      if(existCharRoom.createdBy.toString() !== userId) throw new Error(
        'You are not authorized to view this chat room'
      )
      return existCharRoom;
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
      if(existChatRoom.createdBy.toString() !== userId) throw new Error(
        'You are not authorized to update this chat room'
      )
      const chatRoom = await this.chatroomModel.findOneAndUpdate({ _id: id }, updateChatRoomDto, { new: true });
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
      if(existChatRoom.createdBy.toString() !== userId) throw new Error(
        'You are not authorized to delete this chat room'
      )
      const chatRoom = await this.chatroomModel.findOneAndDelete({ _id: id });
      return chatRoom;
    } catch (error) {
      throw error
    }
  }
}
