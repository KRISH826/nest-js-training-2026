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
        const hash = await bcrypt.hash(registerDto.password, 10);
        const result = await this.userService.createUser({ ...registerDto, password: hash });
        const payload = { role: registerDto.role, email: registerDto.email };
        this.jwtService.signAsync({
        
        })
        return result;
    }
}
