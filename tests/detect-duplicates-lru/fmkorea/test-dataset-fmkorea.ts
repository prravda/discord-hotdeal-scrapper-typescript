import { FmKoreaPopularHotDeal } from '../../../types';

const maxEntries = 50;
// decremental-ordered dataset
export const FMKOREA_BASE_TEST_SUITS: FmKoreaPopularHotDeal[] = [
    ...Array(maxEntries).keys(),
].map<FmKoreaPopularHotDeal>((key) => {
    return {
        id: 5538929600 + key,
        title: '[4대편의점] 3월 편의점 제로칼로리 1+1 행사 (다양) (무료)',
        link: 'https://www.fmkorea.com/5538929600',
    };
});

export const FMKOREA_TEST_SUIT_NEVER_BE_CACHE_HIT: FmKoreaPopularHotDeal = {
    id: 12345678,
    title: 'Popular hot deal which never be cache-hit',
    link: 'https://mock-url.com',
};
