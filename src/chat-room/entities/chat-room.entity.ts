import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ChatRoomDocument = HydratedDocument<ChatRoom>;

@Schema({ timestamps: true })
export class ChatRoom {
    @Prop({ required: true, unique: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    maxMembers!: number;

    @Prop({ default: true })
    active!: boolean;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);