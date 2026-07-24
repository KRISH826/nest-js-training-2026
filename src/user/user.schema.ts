
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RoleType } from 'src/enums/role.type';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({required: true})
  fname: string | undefined;

  @Prop({required: true})
  lname: string | undefined;

  @Prop({required: true, unique: true})
  email: string | undefined;

  @Prop({required: true})
  password: string | undefined;

  @Prop({default: RoleType.STUDENT})
  role: string | undefined;
}

export const UserSchema = SchemaFactory.createForClass(User);
