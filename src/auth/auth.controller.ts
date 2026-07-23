import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
    authService: AuthService;
    constructor(authService: AuthService) {
        this.authService = authService;
    }

    @Post('login')
    login() {
        return this.authService.getLogin();
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.getRegister(registerDto);
    }
}
