import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { RedisService } from 'src/shared/redis/redis.service';
import { UserDto } from './auth.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(private readonly userService: UserService, private jwtService: JwtService, private redisService: RedisService) { }

    private getOtpKey(email: string) {
        return `otp:${email.toLowerCase()}`
    }

    private getOtpCoolDown(email: string) {
        return `otp-cooldown:${email.toLowerCase()}`
    }

    async sendOtp(email: string) {
        const cooldownKey = this.getOtpCoolDown(email);
        const inCoolDownKey = await this.redisService.get(cooldownKey);

        if (inCoolDownKey) {
            throw new BadRequestException('Please wait 60 seconds before requesting another OTP.');
        }

        const otp = crypto.randomInt(100000, 999999);
        const hashedOtp = await bcrypt.hash(otp.toString(), 10);
        const otpkey = this.getOtpKey(email);
        await this.redisService.set(otpkey, hashedOtp, 60);
        await this.redisService.set(cooldownKey, '1', 60);

        this.logger.log(`[DEV ONLY] Generated OTP for ${email}: ${otp}`);

        return {
            message: "OTP sent successfully",
        }
    }

    async verifyOtp(email: string, otp: string) {
        const otpkey = this.getOtpKey(email);
        const storedOtp = await this.redisService.get(otpkey);
        if (!storedOtp) {
            throw new BadRequestException('Invalid OTP');
        }

        const isValid = await bcrypt.compare(otp, storedOtp);
        if (!isValid) {
            throw new BadRequestException('Invalid OTP');
        }

        await this.redisService.del(otpkey);
        const user = (await this.userService.findOrCreateUserByEmail(email, 'email')) as any;
        const tokens = await this.generateTokens(user._id.toString(), user.email);
        await this.userService.updateRefreshToken(user._id.toString(), tokens.refresh_token);

        const isProfileComplete = Boolean(user.fname && user.lname);
        return {
            ...tokens,
            user,
            isProfileComplete
        };
    }

    async handleOauthLogin(oauthUser: { email: string, fname: string, lname: string, provider: string }) {
        try {
            const user = (await this.userService.findOrCreateOauthUser(oauthUser)) as any;
            const tokens = await this.generateTokens(user._id.toString(), user.email);
            await this.userService.updateRefreshToken(user._id.toString(), tokens.refresh_token);

            const isProfileComplete = Boolean(user.fname && user.lname);
            return {
                ...tokens,
                user,
                isProfileComplete
            };
        } catch (error) {
            throw error;
        }

    }

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
