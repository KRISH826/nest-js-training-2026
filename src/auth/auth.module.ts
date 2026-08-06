import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, 
    CloudinaryModule,
    JwtModule.register({
      global: true,
    })
  ],
})
export class AuthModule {}
