import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [RedisService, {
        provide: REDIS_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
            const client = new Redis({
                host: configService.get<string>('REDIS_HOST'),
                port: configService.get<number>('REDIS_PORT'),
                password: configService.get<string>('REDIS_PASSWORD') || undefined,
                db: configService.get<number>('REDIS_DB') || 0,
                tls: configService.get('REDIS_TLS') === 'true' ? {} : undefined,
                retryStrategy: (times) => Math.min(times * 200, 5000),
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
            })

            client.on('connect', () => console.log('[Redis] connecting...'));
            client.on('ready', () => console.log('[Redis] ready'));
            client.on('error', (err) => console.error('[Redis] error', err));
            client.on('close', () => console.warn('[Redis] connection closed'));

            return client
        }
    }],
    exports: [RedisService, REDIS_CLIENT]
})
export class RedisModule { }