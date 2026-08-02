import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { loginDto, RegisterDto } from 'src/auth/auth.dto';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }
    async createUser(registerDto: RegisterDto) {
        try {
            const existUser = await this.userModel.findOne({ email: registerDto.email });
            if(existUser) throw new Error('User Already Exists');
    
            if(!registerDto.fname || !registerDto.lname || !registerDto.email || !registerDto.password) throw new Error('All Fields Are Required');
    
            const user = await this.userModel.create({
                fname: registerDto.fname,
                lname: registerDto.lname,
                email: registerDto.email,
                password: registerDto.password,
            });
            return {
                message: 'User Created Successfully',
                data: user
            }
        } catch (err:unknown) {
            const e = err as {code?: number, message?: string}
            if(e.code === 11000) throw new Error('User Already Exists');
            throw new Error(e.message);
        }
    }

    async loginUser(loginDto: loginDto) {
        const user = await this.userModel.findOne({ email: loginDto.email }).select('+password');
        if (!user) throw new UnauthorizedException('Invalid Credentials');

        const isPasswordValid = await bcrypt.compare(loginDto.password!, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid Credentials');

        return user;
    }

    async getUserByEmail(email:string) {
        try {
            if(!email) throw new Error('Email is required');
            const user = await this.userModel.findOne({ email });
            return user;
        } catch (error) {
            throw error;
        }
    }


    async logOutUser(userId: string) {
        try {
            const user = await this.userModel.findById(userId);
            if(!user) throw new Error('User not found');
            return user;
        } catch (error) {
            throw error;
        }
    }
}
