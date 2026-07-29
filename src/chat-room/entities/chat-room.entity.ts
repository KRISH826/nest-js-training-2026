import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ChatRoomDocument = HydratedDocument<ChatRoom>;

@Schema({ timestamps: true })
export class ChatRoom {
    @Prop({ required: true, unique: true, trim: true, maxlength: 50, minlength: 5 })
    name!: string;

    @Prop({trim: true, maxlength: 255})
    description?: string;

    @Prop({ required: true, max: 50 })
    maxMembers!: number;

    @Prop({ default: true })
    active!: boolean;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
ChatRoomSchema.index({ name: 1 }, { unique: true });