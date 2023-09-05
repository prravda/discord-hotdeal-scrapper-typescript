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
    public async isNewHotDeal(hash: string) {
        try {
            const alreadyExist = await this.connection.get(hash);

            if (!alreadyExist) {
                await this.addKey(hash);
            }
            // alreadyExist is null === this is a new hot deal
            return alreadyExist === null;
        } catch (e) {
            throw e;
        }
    }
}
