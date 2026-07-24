
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RoleType } from 'src/enums/role.type';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  fname!: string;

  @Prop({ required: true })
  lname!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: RoleType.STUDENT })
  role!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
