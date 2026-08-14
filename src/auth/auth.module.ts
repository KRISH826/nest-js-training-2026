import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, FacebookStrategy],
  imports: [UserModule, 
    CloudinaryModule, PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
    })
  ],
})
export class AuthModule {}
