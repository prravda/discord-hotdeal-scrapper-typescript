import { LRUCache } from '../../infra/lru-cache';
import { FmKoreaPopularHotDeal } from '../../types';
import {
    FMKOREA_BASE_TEST_SUITS,
    FMKOREA_TEST_SUIT_NEVER_BE_CACHE_HIT,
} from './fmkorea/test-dataset-fmkorea';

const baseMockKeyName = 'HGFARM';

const maxEntries = 30;

const idCandidates = [...Array(maxEntries).keys()];

const mockFmKoreaPopularHotDealList: FmKoreaPopularHotDeal[] =
    idCandidates.map<FmKoreaPopularHotDeal>((id) => {
        return {
            id,
            title: 'hgfarm products are on sale',
            link: 'https://hgfarm.com',
            seller: 'lawdog',
            productPrice: '123,456KRW',
            shippingCharge: 'FREE',
            category: 'ETC',
        };
    });

describe('LRU cache testing: basic /w FmKoreaPopularHotDeal', () => {
    let lruCacheInstance: LRUCache<FmKoreaPopularHotDeal>;

    beforeEach(() => {
        lruCacheInstance = new LRUCache<FmKoreaPopularHotDeal>();
    });

    it('should be defined', () => {
        expect(lruCacheInstance).toBeDefined();
    });

    it('should create a hash using createHash method', () => {
        expect(lruCacheInstance.createHash(baseMockKeyName)).not.toBe(
            baseMockKeyName
        );
    });

    it('should return null when there is no key exist on cache', () => {
        expect(lruCacheInstance.get('doesNotExistKey')).toBeNull();
    });

    it('should get a entry after successful insert', () => {
        lruCacheInstance.set(baseMockKeyName, mockFmKoreaPopularHotDealList[0]);
        expect(lruCacheInstance.get(baseMockKeyName)).toStrictEqual(
            mockFmKoreaPopularHotDealList[0]
        );
    });

    it('should evict the never be cache-hit one when the entries over than max entry size', () => {
        const uselessEntry = FMKOREA_TEST_SUIT_NEVER_BE_CACHE_HIT;
        const hashValueOfUselessEntry = lruCacheInstance.createHash(
            `${uselessEntry.id}-${uselessEntry.title}`
        );

        lruCacheInstance.set(hashValueOfUselessEntry, uselessEntry);

        FMKOREA_BASE_TEST_SUITS.forEach((suit) => {
            const hashKey = lruCacheInstance.createHash(
                `${suit.id}-${suit.title}`
            );

            lruCacheInstance.set(hashKey, suit);
        });

        expect(lruCacheInstance.get(hashValueOfUselessEntry)).toBeNull();
    });
});
