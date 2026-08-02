import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ChatRoom } from 'src/chat-room/entities/chat-room.entity';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>, 
  @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>) { }
  async create(createChatDto: CreateChatDto, senderId: string) {
    try {
      const chatRoom = await this.chatRoomModel.findById(createChatDto.chatRoom);
      if(!chatRoom) {
        throw new NotFoundException('ChatRoom not found');
      }
      const isOwner = chatRoom.createdBy.toString() === senderId;
      const memberId = chatRoom.members.find((id: any) => id.toString() === senderId);
      if(!isOwner && !memberId) {
        throw new NotFoundException('You are not a member of this chat room');
      }
      const chat = await this.chatModel.create({
        chatRoom: createChatDto.chatRoom,
        sender: senderId,
        message: createChatDto.message
      })
      return chat;
    } catch (error) {
      throw error
    }
  }

  async findByRoom(chatRoomId: string, limit = 30, before?: string) {
    try {
      const query: any = { chatRoom: chatRoomId, deleted: false };
      if (before) {
        const beforeMsg = await this.chatModel.findById(before);
        if (beforeMsg) {
          query.createdAt = { $lt: (beforeMsg as any).createdAt };
        }
      }
  
      const messages = await this.chatModel.find(query).sort({ createdAt: -1 }).limit(limit).populate('sender', 'fname lname').lean();
      return messages.reverse()
      
    } catch (error) {
      throw error
    }
  }

  async findOne(id: string) {
    const chat = await this.chatModel.findById(id);
    if(!chat || chat.deleted) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  async update(id: string, updateChatDto: UpdateChatDto, userId:string) {
      try {
        const chat = await this.chatModel.findById(id);
        if(!chat || chat.deleted) {
          throw new NotFoundException('Chat not found');
        }
        if (chat.sender.toString() !== userId) {
          throw new Error('You are not authorized to update this chat');
        }
        const updatedChat = this.chatModel.findByIdAndUpdate(id, updateChatDto, { new: true });
        return updatedChat
      } catch (error) {
        throw error
      }
  }

  async remove(id: string, userId:string) {
    try {
      const chat = await this.chatModel.findById(id);
      if(!chat || chat.deleted) {
        throw new NotFoundException('Chat not found');
      }
      if (chat.sender.toString() !== userId) {
        throw new Error('You are not authorized to delete this chat');
      }
      const deletedChat = this.chatModel.findByIdAndUpdate(id, { deleted: true }, { new: true });
      return deletedChat;
    } catch (error) {
      throw error
    }
  }
}
