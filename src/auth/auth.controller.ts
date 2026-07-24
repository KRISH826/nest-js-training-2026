import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
    authService: AuthService;
    constructor(authService: AuthService) {
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
}
