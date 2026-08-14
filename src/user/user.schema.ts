import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret: Record<string, any>) => {
      const { refreshtoken, __v, ...cleanUser } = ret;
      return cleanUser;
    },
  },
})
export class User {
  @Prop({ trim: true, default: '' })
  fname!: string;

  @Prop({ trim: true, default: '' })
  lname!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({
    type: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    default: null,
  })
  avatar?: {
    public_id: string;
    url: string;
  };

  @Prop({required: true, default: false})
  refreshtoken!: string;
  
  @Prop({ type: String, enum: ['email', 'google', 'facebook'], default: 'email' })
  provider?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);