import { Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/auth/auth.dto';

@Injectable()
export class UserService {
    createUser(registerDto: RegisterDto) {
        return {
            message: 'User Created Successfully',
        }
    }

    loginUser() {
        return {
            message: 'User Logged In Successfully',
        }
    }
}
