import Redis from 'ioredis';
import { ENV_LIST } from '../env-config';

export const duplicateTableRedis = new Redis({
    host: 'duplicate-table-redis',
    port: 6381,
    password: ENV_LIST.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
});
