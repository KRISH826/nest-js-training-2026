import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private readonly inFlightRequests = new Map<string, Promise<any>>();
    private readonly ttlTime = 7200;
    constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) { }

    async get<T = any>(key: string): Promise<T | null> {
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            this.logger.error(`Redis GET Error (${key})`, err);
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds = this.ttlTime,): Promise<void> {
        try {
            await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds,);
        } catch (err) {
            this.logger.error(`Redis SET Error (${key})`, err);
        }
    }


    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (err) {
            this.logger.error(`Redis DEL Error (${key})`, err);
        }
    }

    async delPattern(pattern: string):Promise<void> {
        try {
            const stream = this.client.scanStream({
               'match': pattern,
               'count': 100
            });
            const pipeline = this.client.pipeline();
            for await (const keys of stream) {
                keys.forEach(key => {
                    pipeline.unlink(key);
                });
            }

            await pipeline.exec();
        } catch (error) {
            this.logger.error(`Redis DEL Pattern Error (${pattern})`, error);
        }
    }

    async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds = this.ttlTime): Promise<T> {
        const cached = await this.get<T>(key);
        if(cached !== null) return cached;

        // already fetching
        const existCache = this.inFlightRequests.get(key);
        if(existCache) return existCache;

        const promise = (async () => {
            try {
                const result = await fetchFn();
                await this.set(key, result, ttlSeconds);
                return result;
            } catch (error) {
                this.inFlightRequests.delete(key);
                throw error;
            }
            finally {
                this.inFlightRequests.delete(key);
            }
        })();

        this.inFlightRequests.set(key, promise);
        return promise;
    }

    getClient(): Redis {
        return this.client;
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

}
