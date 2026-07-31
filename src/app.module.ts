import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CourseModule } from './course/course.module';
import { ChatStreamGateway } from './chat-stream/chat-stream.gateway';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { RedisModule } from './redis/redis.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
    }),
    RedisModule,
    AuthModule, 
    UserModule, 
    CourseModule,
    ChatRoomModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatStreamGateway],
})
export class AppModule {}
