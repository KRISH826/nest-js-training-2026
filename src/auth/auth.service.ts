import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    getLogin() {
        return 'login';
    }

    getRegister() {
        return {
            message: 'User Registered Successfully',
        }
    }
}
