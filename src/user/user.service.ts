import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from 'src/auth/auth.dto';
import { User } from './user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }
    async createUser(registerDto: RegisterDto) {
        try {
            const existUser = await this.userModel.findOne({ email: registerDto.email });
            if(existUser) throw new Error('User Already Exists');
    
            if(!registerDto.fname || !registerDto.lname || !registerDto.email || !registerDto.password) throw new Error('All Fields Are Required');
    
            await this.userModel.create({
                fname: registerDto.fname,
                lname: registerDto.lname,
                email: registerDto.email,
                password: registerDto.password,
                role: registerDto.role
            });
            return {
                message: 'User Created Successfully',
            }
        } catch (err:unknown) {
            const e = err as {code?: number, message?: string}
            if(e.code === 11000) throw new Error('User Already Exists');
            throw new Error(e.message);
        }
    }

    loginUser() {
        return {
            message: 'User Logged In Successfully',
        }
    }
}
