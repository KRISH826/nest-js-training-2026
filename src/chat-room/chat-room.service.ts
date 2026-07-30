import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom } from './entities/chat-room.entity';

@Injectable()
export class ChatRoomService {
  constructor(@InjectModel(ChatRoom.name) private chatroomModel: Model<ChatRoom>) { }
  async create(createChatRoomDto: CreateChatRoomDto) {
    try {
      const existChatRoom = await this.chatroomModel.findOne({ name: createChatRoomDto.name });
      if (existChatRoom) {
        throw new Error('ChatRoom already exists');
      }
      if(!createChatRoomDto.name || !createChatRoomDto.description || !createChatRoomDto.maxMembers) {
        throw new Error('All fields are required');
      }
      const chatRoom = await this.chatroomModel.create(createChatRoomDto);
      return chatRoom;
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    try {
      const chatRooms = await this.chatroomModel.find();
      return chatRooms;
    } catch (error) {
      throw error
    }
  }

  async findOne(id: string) {
    try {
      const existCharRoom = await this.chatroomModel.findOne({ _id: id });
      if (!existCharRoom) {
        throw new Error('ChatRoom not found');
      }
      return existCharRoom;
    } catch (error) {
      throw error
    }
  }

  update(id: string, updateChatRoomDto: UpdateChatRoomDto) {
    try {
      const existChatRoom = this.chatroomModel.findOne({ _id: id });
      if (!existChatRoom) {
        throw new Error('ChatRoom not found');
      }
      const chatRoom = this.chatroomModel.findOneAndUpdate({ _id: id }, updateChatRoomDto, { new: true });
      return chatRoom;
    } catch (error) {
      throw error
    }
  }

  remove(id: string) {
    try {
      const existChatRoom = this.chatroomModel.findOne({ _id: id });
      if (!existChatRoom) {
        throw new Error('ChatRoom not found');
      }
      const chatRoom = this.chatroomModel.findOneAndDelete({ _id: id });
      return chatRoom;
    } catch (error) {
      throw error
    }
  }
}
