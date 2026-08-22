import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOrCreateUserByEmail(email: string, provider: string = 'email') {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new NotFoundException('User not found');
      const newUser = await this.userModel.create({ email, provider });
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async findOrCreateOauthUser(oauthData: {
    email: string;
    fname: string;
    lname: string;
    provider: string;
  }) {
    try {
      let user = await this.userModel.findOne({ email: oauthData.email });
      if (!user) {
        user = await this.userModel.create({
          email: oauthData.email,
          fname: oauthData.fname,
          lname: oauthData.lname,
          provider: oauthData.provider,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      if (!email) throw new Error('Email is required');
      const user = await this.userModel.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByidWithRefreshToken(userId: string) {
    return await this.userModel.findById(userId).select('+refreshToken');
  }

  async findUserById(userId: string) {
    try {
      if (!userId) throw new Error('User Id is required');
      const user = await this.userModel.findById(userId);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: string, updateData: Partial<User>) {
    try {
      if (!userId) throw new Error('User Id is required');
      const user = await this.userModel.findByIdAndUpdate(userId, updateData, {
        returnDocument: 'after',
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateRefreshToken(userId: string, refreshToken?: string) {
    try {
      if (refreshToken) {
        const hash = await bcrypt.hash(refreshToken, 10);
        refreshToken = hash;
        await this.userModel.findByIdAndUpdate(
          userId,
          { refreshToken },
          { returnDocument: 'after' },
        );
      } else {
        await this.userModel.findByIdAndUpdate(
          userId,
          { refreshToken: null },
          { returnDocument: 'after' },
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async logOutUser(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      await this.updateRefreshToken(userId, undefined);
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      throw error;
    }
  }
}
