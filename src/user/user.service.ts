import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from 'src/auth/auth.dto';
import { User } from './user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }
    async createUser(registerDto: RegisterDto) {
        await this.userModel.create(registerDto);
        return {
            message: 'User Created Successfully',
        }
    }

    loginUser() {
        return {
            message: 'User Logged In Successfully',
        }
    }
}
