import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
    register() {
        return this.authService.getRegister();
    }
}
