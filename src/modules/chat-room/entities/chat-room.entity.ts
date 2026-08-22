import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ChatRoomDocument = HydratedDocument<ChatRoom>;

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    maxlength: 50,
    minlength: 5,
  })
  name!: string;

  @Prop({ trim: true, maxlength: 255 })
  description?: string;

  @Prop({ required: true, max: 50 })
  maxMembers!: number;

  @Prop({ default: true })
  active!: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  members!: Types.ObjectId[];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

ChatRoomSchema.index({ name: 1 });
ChatRoomSchema.index({ active: 1 });
ChatRoomSchema.index({ members: 1 });
