import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, RegisterDto, UserDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { UserService } from 'src/user/user.service';
import express from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

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
        if(!user) throw new Error('User Not Found');
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
}
