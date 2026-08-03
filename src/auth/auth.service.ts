import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { loginDto, RegisterDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private jwtService: JwtService) { }

    async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email: email };
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: jwtConstants.accessSecret!,
                expiresIn: jwtConstants.accessExpiresIn as any,
            }),
            this.jwtService.signAsync(payload, {
                secret: jwtConstants.refreshSecret!,
                expiresIn: jwtConstants.refreshExpiresIn as any,
            })
        ])
        return {
            access_token,
            refresh_token
        };
    }
    async getLogin(loginDto: loginDto) {
        const user = await this.userService.loginUser(loginDto);
        const tokens = await this.generateTokens(user._id.toString(), user.email);
        await this.userService.updateRefreshToken(user._id.toString(), tokens.refresh_token);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
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
        const tokens = await this.generateTokens(created._id.toString(), created.email);
        await this.userService.updateRefreshToken(created._id.toString(), tokens.refresh_token);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: created
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.userService.getUserByidWithRefreshToken(userId);
        if (!user || !user.refreshtoken) {
            throw new ForbiddenException('Access Denied');
        }
        const matches = await bcrypt.compare(refreshToken, user.refreshtoken);
        if (!matches) {
            throw new ForbiddenException('Access Denied');
        }

        try {
            await this.jwtService.verifyAsync(refreshToken, {
                secret: jwtConstants.refreshSecret!,
            })
        } catch (error) {
            throw new ForbiddenException('Token Expired Please Login Again');
        }

        const tokens = await this.generateTokens(user._id.toString(), user.email);
        await this.userService.updateRefreshToken(user._id.toString(), tokens.refresh_token);
        return tokens;
    }


    async userGetByEmail(email: string) {
        const user = await this.userService.getUserByEmail(email);
        return user;
    }

    async userLogOut(userId: string) {
        const user = await this.userService.logOutUser(userId);
        await this.userService.updateRefreshToken(userId, undefined);
        return user;
    }

}
