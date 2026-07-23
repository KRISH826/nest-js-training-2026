import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) { }
    getLogin() {
        const result = this.userService.loginUser();
        return result;
    }

    async getRegister(registerDto: RegisterDto) {
        const hash = await bcrypt.hash(registerDto.password, 10);
        const result = this.userService.createUser({ ...registerDto, password: hash });
        return result;
    }
}
