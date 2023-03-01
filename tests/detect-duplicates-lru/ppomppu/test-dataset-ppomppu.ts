import { PpomppuHotDeal } from '../../../types';

const maxEntries = 50;
// decremental-ordered dataset
export const PPOMPPU_BASE_TEST_SUITS: PpomppuHotDeal[] = [
    ...Array(maxEntries).keys(),
].map<PpomppuHotDeal>((key) => {
    return {
        id: 5538929600 + key,
        title: '[4대편의점] 3월 편의점 제로칼로리 1+1 행사 (다양) (무료)',
        link: `https://www.ppomppu.com/${5538929600 + key}`,
    };
});

export const PPOMPPU_TEST_SUIT_NEVER_BE_CACHE_HIT: PpomppuHotDeal = {
    id: 12345678,
    title: 'Popular hot deal which never be cache-hit',
    link: 'https://mock-url.com',
};
