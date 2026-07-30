import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { loginDto, RegisterDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private jwtService: JwtService) { }
    async getLogin(loginDto: loginDto) {
        const user = await this.userService.loginUser(loginDto);
        const payload = { sub: user._id, email: user.email};
        const token = await this.jwtService.signAsync(payload);
        return {
            access_token: token,
            user
        };
    }

    async getRegister(registerDto: RegisterDto) {
        const password = registerDto.password;
        if (!password) {
            throw new Error('Password is required');
        }
        const hash = await bcrypt.hash(password, 10);
        const result = await this.userService.createUser({ ...registerDto, password: hash });
        const created = result.data;
        const payload = { sub: created._id, email: created.email};
        const token = await this.jwtService.signAsync(payload);
        return { access_token: token };
    }

    async userGetByEmail(email: string) {
        const user = await this.userService.getUserByEmail(email);
        return user;
    }
}
