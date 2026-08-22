import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async findOrCreateUserByEmail(email: string, provider: string = 'email') {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      let user = await this.userModel.findOne({ email: normalizedEmail });
      if (!user) {
        user = await this.userModel.create({ email: normalizedEmail, provider });
      }
      return user;
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
      const normalizedEmail = oauthData.email.toLowerCase().trim();
      let user = await this.userModel.findOne({ email: normalizedEmail });
      if (!user) {
        user = await this.userModel.create({
          email: normalizedEmail,
          fname: oauthData.fname,
          lname: oauthData.lname,
          provider: oauthData.provider,
        });
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      if (!email) throw new BadRequestException('Email is required');
      const normalizedEmail = email.toLowerCase().trim();
      const user = await this.userModel.findOne({ email: normalizedEmail });
      if (!user) throw new NotFoundException('User not found');
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
      if (!userId) throw new BadRequestException('User Id is required');
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: string, updateData: Partial<User>) {
    try {
      if (!userId) throw new BadRequestException('User Id is required');
      const user = await this.userModel.findByIdAndUpdate(userId, updateData, {
        returnDocument: 'after',
      });
      if (!user) throw new NotFoundException('User not found');
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
      if (!user) throw new NotFoundException('User not found');
      await this.updateRefreshToken(userId, undefined);
      return user;
    } catch (error) {
      throw error;
    }
  }
}
