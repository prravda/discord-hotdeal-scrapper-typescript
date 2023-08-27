import axios from 'axios';
import { RuntimeConfig } from '../../infra/runtime-config';
import { parseHTML } from 'linkedom';
import { decode } from 'iconv-lite';
import { PpomppuHotDeal } from '../../types';
import { LRUCache } from '../../infra/lru-cache';
import { LokiLogger } from '../../infra/logger/loki-logger';

export class PpomppuHotDealScrapper {
    private LRUCacheForPpomppuPopularHotDeal = new LRUCache<PpomppuHotDeal>();

    protected refreshPopularHotDeal(popularHotDealList: PpomppuHotDeal[]) {
        if (this.LRUCacheForPpomppuPopularHotDeal.size() === 0) {
            popularHotDealList.forEach((deal) => {
                const hashKey =
                    this.LRUCacheForPpomppuPopularHotDeal.createHash(
                        `${deal.id}-${deal.title}`
                    );
                LokiLogger.getLogger().info({
                    labels: {
                        origin: 'ppomppu',
                        target: 'hotdeal',
                        dealType: 'general',
                    },
                    message: {
                        id: deal.id,
                        title: deal.title,
                        hash: hashKey,
                    },
                });
                this.LRUCacheForPpomppuPopularHotDeal.set(hashKey, deal);
            });

            return popularHotDealList;
        }

        const result = popularHotDealList.filter(
            (deal) =>
                this.LRUCacheForPpomppuPopularHotDeal.get(
                    this.LRUCacheForPpomppuPopularHotDeal.createHash(
                        `${deal.id}-${deal.title}`
                    )
                ) === null
        );

        result.forEach((deal) => {
            const hashKey = this.LRUCacheForPpomppuPopularHotDeal.createHash(
                `${deal.id}-${deal.title}`
            );
            LokiLogger.getLogger().info({
                labels: {
                    origin: 'ppomppu',
                    target: 'hotdeal',
                    dealType: 'general',
                },
                message: {
                    id: deal.id,
                    title: deal.title,
                    hash: hashKey,
                },
            });
            this.LRUCacheForPpomppuPopularHotDeal.set(hashKey, deal);
        });

        return result;
    }

    public async getRefreshedHotDealList() {
        try {
            const refreshedDealList = await this.parseHotDeal();
            return this.refreshPopularHotDeal(refreshedDealList);
        } catch (e) {
            throw e;
        }
    }
    public async parseHotDeal() {
        try {
            const result = await axios.request({
                url: RuntimeConfig.PPOMPPU_HOT_DEAL_URL,
                headers: {
                    host: `www.ppomppu.co.kr`,
                    'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36`,
                    'sec-ch-ua': `"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"`,
                    'sec-ch-ua-mobile': `?0`,
                    'sec-ch-ua-platform': `macOS`,
                },
                method: 'GET',
                responseType: 'arraybuffer',
                responseEncoding: 'binary',
            });
            const { document } = parseHTML(decode(result.data, 'EUC-KR'));

            const hotDealTableLinks = document.body
                .querySelector<HTMLTableElement>('.board_table')
                ?.querySelectorAll<HTMLAnchorElement>('a.title:not([style])');

            const dealList: PpomppuHotDeal[] = [];

            if (hotDealTableLinks === undefined) {
                throw new Error(
                    'An error is occurred while getting ppomppu hot deal'
                );
            }

            hotDealTableLinks.forEach((eachHotDeal) => {
                const baseUrl = 'https://www.ppomppu.co.kr';
                const dealLink = eachHotDeal.getAttribute('href');
                const title = eachHotDeal.textContent;

                dealList.push({
                    id: dealLink ? Number(dealLink.split('&no=')[1]) : 0,
                    title: title ? title.trim() : '링크 접속 후 확인해주세요!',
                    link: `${baseUrl}${dealLink}`,
                });
            });

            return dealList;
        } catch (e: unknown) {
            const errorAsErrorObject = e as Error;
            LokiLogger.getLogger().error({
                label: {
                    origin: 'ppomppu',
                },
                message: `error=${errorAsErrorObject.stack}`,
            });
            throw e;
        }
    }
}
