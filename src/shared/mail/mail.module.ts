import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './mail.queue';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      }
    }),
    BullModule.registerQueue({
      name: 'mail-queue',
    })
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService, BullModule]
})
export class MailModule { }
