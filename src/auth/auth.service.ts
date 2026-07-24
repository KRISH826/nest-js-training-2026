import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private jwtService: JwtService) { }
    getLogin() {
        const result = this.userService.loginUser();
        return result;
    }

    async getRegister(registerDto: RegisterDto) {
        const password = registerDto.password;
        if (!password) {
            throw new Error('Password is required');
        }
        const hash = await bcrypt.hash(password, 10);
        const result = await this.userService.createUser({ ...registerDto, password: hash });
        const created = result as RegisterDto;
        const payload = { email: created.email, role: created.role };
        const token = await this.jwtService.signAsync(payload);
        return {access_token: token};
    }
}
