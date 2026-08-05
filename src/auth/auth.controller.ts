import { Body, Controller, FileTypeValidator, ForbiddenException, Get, MaxFileSizeValidator, ParseFilePipe, Patch, Post, Req, Res, UploadedFile, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, RegisterDto, UpdateProfileDto, UserDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { UserService } from 'src/user/user.service';
import express from 'express';
import 'multer';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    private setAccessTokenCookie(res: express.Response, accessToken: string) {
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 5 * 60 * 1000, // 5 minutes
        });
    }

    @Post('login')
    async login(@Body() loginDto: loginDto, @Res({ passthrough: true }) res: express.Response) {
        const result = await this.authService.getLogin(loginDto);
        this.setAccessTokenCookie(res, result.access_token);
        return {
            message: 'User logged in successfully',
            data: result,
        };
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: express.Response) {
        const result = await this.authService.getRegister(registerDto);
        this.setAccessTokenCookie(res, result.access_token);
        return {
            message: 'User registered successfully',
            data: result,
        };
    }



    @UseGuards(AuthGuard)
    @Get('profile')
    async userProfile(@Req() req: express.Request) {
        const user = await this.authService.userGetByEmail(req['user'].email);
        if (!user) throw new Error('User Not Found');
        return {
            fname: user.fname,
            lname: user.lname,
            email: user.email,
        };
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response,) {
        const userId = req['user'].sub;
        const result = await this.authService.userLogOut(userId);
        res.clearCookie('access_token');
        return {
            message: 'User logged out successfully',
            data: result,
        };
    }

    @UseGuards(AuthGuard)
    @Post('profile')
    async getProfile(@Req() req: express.Request) {
        const userId = req['user'].sub;
        const user = await this.userService.findUserById(userId);
        if (!user) throw new Error('User Not Found');
        return {
            message: "User profile fetched successfully",
            data: user
        };
    }

    @UseGuards(AuthGuard)
    @Patch('profile')
    async updateProfile(
        @Req() req: express.Request,
        @Body() updateProfileDto: UpdateProfileDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new FileTypeValidator({ fileType: 'image/jpeg|image/png|image/jpg' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                ],
            }),
        ) file?: Express.Multer.File,
    ) {
        const userId = req['user'].sub;
        let newAvatar: { public_id: string; url: string } | undefined = undefined;
        if (file) {
            const currentUser = await this.userService.findUserById(userId);
            if (!currentUser) throw new ForbiddenException('User Not Found');
            if (currentUser.avatar?.public_id) {
                try {
                    await this.cloudinaryService.deleteImage(currentUser.avatar.public_id);
                    console.log('Deleted old avatar from Cloudinary');
                } catch (error) {
                    console.log('Error deleting old avatar from Cloudinary:', error);
                }
            }

            const uploadResult = await this.cloudinaryService.uploadImage(file, 'user_avatars');
            newAvatar = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
            };

            const updateUser = await this.userService.updateUser(userId, {
                ...updateProfileDto,
                avatar: newAvatar,
            });

            return {
                message: 'User profile updated successfully',
                data: updateUser,
            }

        }
    }
}
