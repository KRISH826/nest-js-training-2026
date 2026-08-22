import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  ForbiddenException,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto, UpdateProfileDto, VerifyOtpDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { UserService } from 'src/user/user.service';
import express, { CookieOptions } from 'express';
import 'multer';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from './auth.types';
import { tryCatch } from 'bullmq';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';


const COOKIE_BASE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService
  ) { }

  private setAuthCookie(res: express.Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      ...COOKIE_BASE_OPTIONS,
      maxAge: 10 * 60 * 1000
    });

    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_BASE_OPTIONS,
      path: '/api/auth',
      maxAge: 100 * 24 * 60 * 60 * 1000,
    });
  }

  private clearCookie(res: express.Response) {
    res.clearCookie('access_token', {
      ...COOKIE_BASE_OPTIONS,
      maxAge: 0
    });
    res.clearCookie('refresh_token', {
      ...COOKIE_BASE_OPTIONS,
      path: '/api/auth',
      maxAge: 0
    });
  }

  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    try {
      const otp = await this.authService.sendOtp(dto.email!);
      return otp;
    } catch (error) {
      throw error;
    }
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const email = dto.email;
    const otp = dto.otp;
    if (!email || !otp) {
      throw new BadRequestException('Field is required');
    }

    try {
      const result = await this.authService.verifyOtp(email, otp);
      this.setAuthCookie(res, result.access_token, result.refresh_token);
      return {
        message: 'OTP verified successfully',
        redirectToProfileUpdate: !result.isProfileComplete,
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post("refresh")
  async refreshTokens(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const rawRefreshToken = req.cookies?.['refresh_token'];
    if (!rawRefreshToken) throw new ForbiddenException('Refresh token not found');
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwtService.verifyAsync(rawRefreshToken, {
        secret: jwtConstants.refreshSecret
      })
    } catch (error) {
      this.clearCookie(res);
      throw new ForbiddenException('Refresh token invalid or expired');
    }
    const tokens = await this.authService.refreshTokens(payload.sub, rawRefreshToken);
    this.setAuthCookie(res, tokens.access_token, tokens.refresh_token);
    return {
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const userId = req.user.sub;
    const result = await this.authService.userLogOut(userId);
    this.clearCookie(res)
    return {
      message: 'User logged out successfully',
      data: result,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const user = await this.userService.findUserById(userId);
    if (!user) throw new NotFoundException('User Not Found');
    return {
      message: 'User profile fetched successfully',
      data: user,
    };
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('profile')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: 'image/jpeg|image/png|image/jpg' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const userId = req.user.sub;
    let newAvatar: { public_id: string; url: string } | undefined = undefined;

    if (file) {
      const currentUser = await this.userService.findUserById(userId);
      if (!currentUser) throw new ForbiddenException('User Not Found');
      if (currentUser.avatar?.public_id) {
        try {
          await this.cloudinaryService.deleteImage(
            currentUser.avatar.public_id,
          );
        } catch (error) {
          console.log('Error deleting old avatar from Cloudinary:', error);
        }
      }
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'user_avatars',
      );
      newAvatar = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    const updateUser = await this.userService.updateUser(userId, {
      ...updateProfileDto,
      ...(newAvatar && { avatar: newAvatar }),
    });

    return {
      message: 'User profile updated successfully',
      data: updateUser,
    };
  }
}
