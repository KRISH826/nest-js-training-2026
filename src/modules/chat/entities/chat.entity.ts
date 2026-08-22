import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
   @Prop({type: Types.ObjectId, ref: 'ChatRoom', required: true}) 
   chatRoom!:Types.ObjectId;

   @Prop({type: Types.ObjectId, ref: 'User', required: true})
   sender!: Types.ObjectId;

   @Prop({required: true, trim: true, maxLength:1000})
   message!: string

   @Prop({default: false})
   edited!: boolean

   @Prop({default: false})
   deleted!: boolean
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.index({ chatRoom: 1, createdAt: 1 }); // fast history queries