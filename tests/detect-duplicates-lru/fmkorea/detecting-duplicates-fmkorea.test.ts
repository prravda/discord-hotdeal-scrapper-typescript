import { FmkoreaHotDealScrapper } from '../../../src/scrappers/fmkorea-hot-deal-scrapper';
import { FmKoreaPopularHotDeal } from '../../../types';
import {
    FMKOREA_BASE_TEST_SUITS,
    FMKOREA_TEST_SUIT_NEVER_BE_CACHE_HIT,
} from './test-dataset-fmkorea';

class FmKoreaScrapperForTest extends FmkoreaHotDealScrapper {
    constructor() {
        super();
    }

    public refreshPopularHotDealForTest(
        popularDealList: FmKoreaPopularHotDeal[]
    ) {
        return this.refreshPopularHotDeal(popularDealList);
    }
}

describe('Test: detecting duplicates from FMKOREA popular hot deal', () => {
    let testInstance: FmKoreaScrapperForTest;
    beforeEach(() => {
        testInstance = new FmKoreaScrapperForTest();
    });

    it('should be defined', () => {
        expect(testInstance).toBeDefined();
    });

    it('should return all deals at first refreshing process', () => {
        const numberOfTestSuit = 5;
        const partialTestSuits = FMKOREA_BASE_TEST_SUITS.slice(
            0,
            numberOfTestSuit
        );

        const refreshedResult =
            testInstance.refreshPopularHotDealForTest(partialTestSuits);

        expect(refreshedResult).toStrictEqual(partialTestSuits);
    });

    it('should return an empty array as a response of all-duplicated double input', () => {
        const numberOfTestSuit = 5;
        const partialTestSuits = FMKOREA_BASE_TEST_SUITS.slice(
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
        const partialTestSuits = FMKOREA_BASE_TEST_SUITS.slice(
            0,
            numberOfTestSuit
        );

        testInstance.refreshPopularHotDealForTest(partialTestSuits);
        testInstance.refreshPopularHotDealForTest(partialTestSuits);
        const refreshedResultAfterDuplicatesExceptOne =
            testInstance.refreshPopularHotDealForTest([
                FMKOREA_TEST_SUIT_NEVER_BE_CACHE_HIT,
            ]);

        expect(refreshedResultAfterDuplicatesExceptOne.length).toBe(1);
        expect(refreshedResultAfterDuplicatesExceptOne).toStrictEqual([
            FMKOREA_TEST_SUIT_NEVER_BE_CACHE_HIT,
        ]);
    });
});
