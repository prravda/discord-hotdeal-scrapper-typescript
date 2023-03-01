import { PpomppuHotDeal } from '../../../types';
import {
    PPOMPPU_BASE_TEST_SUITS,
    PPOMPPU_TEST_SUIT_NEVER_BE_CACHE_HIT,
} from './test-dataset-ppomppu';
import { PpomppuHotDealScrapper } from '../../../src/scrappers/ppomppu-hot-deal-scrapper';

class FmKoreaScrapperForTest extends PpomppuHotDealScrapper {
    constructor() {
        super();
    }

    public refreshPopularHotDealForTest(popularDealList: PpomppuHotDeal[]) {
        return this.refreshPopularHotDeal(popularDealList);
    }
}

describe('Test: detecting duplicates from ppomppu popular hot deal', () => {
    let testInstance: FmKoreaScrapperForTest;
    beforeEach(() => {
        testInstance = new FmKoreaScrapperForTest();
    });

    it('should be defined', () => {
        expect(testInstance).toBeDefined();
    });

    it('should return all deals at first refreshing process', () => {
        const numberOfTestSuit = 5;
        const partialTestSuits = PPOMPPU_BASE_TEST_SUITS.slice(
            0,
            numberOfTestSuit
        );

        const refreshedResult =
            testInstance.refreshPopularHotDealForTest(partialTestSuits);

        expect(refreshedResult).toStrictEqual(partialTestSuits);
    });

    it('should return an empty array as a response of all-duplicated double input', () => {
        const numberOfTestSuit = 5;
        const partialTestSuits = PPOMPPU_BASE_TEST_SUITS.slice(
            0,
            numberOfTestSuit
        );

        testInstance.refreshPopularHotDealForTest(partialTestSuits);
        const refreshedResultAfterDuplicates =
            testInstance.refreshPopularHotDealForTest(partialTestSuits);

        expect(refreshedResultAfterDuplicates.length).toBe(0);
    });

    it('should return an one element as a response of all-duplicated double input except one', () => {
        const numberOfTestSuit = 5;
        const partialTestSuits = PPOMPPU_BASE_TEST_SUITS.slice(
            0,
            numberOfTestSuit
        );

        testInstance.refreshPopularHotDealForTest(partialTestSuits);
        testInstance.refreshPopularHotDealForTest(partialTestSuits);
        const refreshedResultAfterDuplicatesExceptOne =
            testInstance.refreshPopularHotDealForTest([
                PPOMPPU_TEST_SUIT_NEVER_BE_CACHE_HIT,
            ]);

        expect(refreshedResultAfterDuplicatesExceptOne.length).toBe(1);
        expect(refreshedResultAfterDuplicatesExceptOne).toStrictEqual([
            PPOMPPU_TEST_SUIT_NEVER_BE_CACHE_HIT,
        ]);
    });
});
