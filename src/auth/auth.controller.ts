import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, RegisterDto, UserDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    authService: AuthService;
    constructor(authService: AuthService, userService: UserService) {
        this.authService = authService;
    }

    @Post('login')
    login(@Body() loginDto: loginDto) {
        return this.authService.getLogin(loginDto);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const result = await this.authService.getRegister(registerDto);
        return result;
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async userProfile(@Req() req: Request) {
        const user = await this.authService.userGetByEmail(req['user'].email);
        if(!user) throw new Error('User Not Found');
        return {
            fname: user.fname,
            lname: user.lname,
            email: user.email,
            role: user.role
        };
    }
}
