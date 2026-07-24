import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

@Module({
  providers: [UserService],
  exports: [UserService, MongooseModule.forFeature([{name: User.name , schema: UserSchema}])],
})
export class UserModule {}
