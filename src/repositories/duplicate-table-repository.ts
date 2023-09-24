import { DuplicateTableRepositoryInterface } from './duplicate-table-repository.interface';
import { duplicateTableRedis } from '../../infra/duplicate-table/duplicate-table-redis';
import Redis from 'ioredis';

export class DuplicateTableRepository
    implements DuplicateTableRepositoryInterface
{
    private readonly connection: Redis = duplicateTableRedis;
    private readonly sixHoursInSec = 60 * 60 * 6;

    private async addKey(hash: string): Promise<void> {
        try {
            await this.connection.set(hash, 1, 'EX', this.sixHoursInSec);
        } catch (e) {
            throw e;
        }
    }
    private async updateExpire(hash: string): Promise<void> {
        try {
            await this.connection.expire(hash, this.sixHoursInSec);
        } catch (e) {
            throw e;
        }
    }
    public async isNewHotDeal(hash: string) {
        try {
            const alreadyExist = await this.connection.get(hash);

            // if this hot deal is a fresh hot deal, add key to redis
            if (!alreadyExist) {
                await this.addKey(hash);
            }

            // although this is not a fresh hot deal,
            // update expiration time using expire command
            if (alreadyExist) {
                await this.updateExpire(hash);
            }

            // return alreadyExist === null as a result
            // if this calculation is true, it is a fresh hot deal
            return alreadyExist === null;
        } catch (e) {
            throw e;
        }
    }
}
