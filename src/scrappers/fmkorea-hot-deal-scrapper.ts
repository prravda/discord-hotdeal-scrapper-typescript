import { chromium, devices } from 'playwright-core';
import { RuntimeConfig } from '../../infra/runtime-config';
import { Page } from '@playwright/test';
import {
    FmKoreaGeneralHotDeal,
    FmKoreaPopularHotDeal,
    FmKoreaTotalHotDeal,
} from '../../types';
import { LRUCache } from '../../infra/lru-cache';

export class FmkoreaHotDealScrapper {
    private LRUCacheForFmKoreaPopularHotDeal =
        new LRUCache<FmKoreaPopularHotDeal>();
    private LRUCacheForFmKoreaGeneralHotDeal =
        new LRUCache<FmKoreaGeneralHotDeal>();
    private readonly srlOnError = 99999;
    private readonly textPlaceHolderOnError = '접속 후 확인해 주세요';

    public async getRefreshedHotDealList(): Promise<FmKoreaTotalHotDeal> {
        try {
            const { popular, general } = await this.parseHotDeal();

            return {
                general: this.refreshGeneralHotDeal(general),
                popular: this.refreshPopularHotDeal(popular),
            };
        } catch (e) {
            throw e;
        }
    }

    protected refreshPopularHotDeal(
        popularHotDealList: FmKoreaPopularHotDeal[]
    ) {
        if (this.LRUCacheForFmKoreaPopularHotDeal.size() === 0) {
            popularHotDealList.forEach((deal) => {
                const hashKey =
                    this.LRUCacheForFmKoreaPopularHotDeal.createHash(
                        `${deal.id}-${deal.title}`
                    );
                console.log(
                    `fmkorea-popular: ${deal.id} / ${deal.title} / ${hashKey}`
                );
                this.LRUCacheForFmKoreaPopularHotDeal.set(hashKey, deal);
            });

            return popularHotDealList;
        }

        const result = popularHotDealList.filter(
            (deal) =>
                this.LRUCacheForFmKoreaPopularHotDeal.get(
                    this.LRUCacheForFmKoreaPopularHotDeal.createHash(
                        `${deal.id}-${deal.title}`
                    )
                ) === null
        );

        result.forEach((deal) => {
            const hashKey = this.LRUCacheForFmKoreaPopularHotDeal.createHash(
                `${deal.id}-${deal.title}`
            );
            console.log(
                `fmkorea-popular: ${deal.id} / ${deal.title} / ${hashKey}`
            );
            this.LRUCacheForFmKoreaPopularHotDeal.set(hashKey, deal);
        });

        return result;
    }

    protected refreshGeneralHotDeal(
        generalHotDealList: FmKoreaGeneralHotDeal[]
    ) {
        if (this.LRUCacheForFmKoreaGeneralHotDeal.size() === 0) {
            generalHotDealList.forEach((deal) => {
                const hashKey =
                    this.LRUCacheForFmKoreaGeneralHotDeal.createHash(
                        `${deal.id}-${deal.title}`
                    );
                console.log(
                    `fmkorea-general: ${deal.id} / ${deal.title} / ${hashKey}`
                );
                this.LRUCacheForFmKoreaGeneralHotDeal.set(hashKey, deal);
            });

            return generalHotDealList;
        }

        const result = generalHotDealList.filter(
            (deal) =>
                this.LRUCacheForFmKoreaGeneralHotDeal.get(
                    this.LRUCacheForFmKoreaGeneralHotDeal.createHash(
                        `${deal.id}-${deal.title}`
                    )
                ) === null
        );

        result.forEach((deal) => {
            const hashKey = this.LRUCacheForFmKoreaGeneralHotDeal.createHash(
                `${deal.id}-${deal.title}`
            );
            console.log(
                `fmkorea-general: ${deal.id} / ${deal.title} / ${hashKey}`
            );
            this.LRUCacheForFmKoreaGeneralHotDeal.set(hashKey, deal);
        });

        return result;
    }

    private getFmKoreaBasicHeader() {
        return {
            method: 'GET',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            referer: 'https://www.fmkorea.com/',
        };
    }
    private getRandomUserAgent() {
        const deviceDescriptors = [
            devices['Desktop Chrome'],
            devices['Desktop Chrome HiDPI'],

            devices['Desktop Edge'],
            devices['Desktop Edge HiDPI'],

            devices['Desktop Safari'],

            devices['Galaxy S8'],
            devices['Galaxy S9+'],

            devices['iPhone 8'],
            devices['iPhone 8 Plus'],

            devices['iPhone SE'],

            devices['iPhone X'],
            devices['iPhone XR'],

            devices['iPhone 11'],
            devices['iPhone 11 Pro'],
            devices['iPhone 11 Pro Max'],

            devices['iPhone 12'],
            devices['iPhone 12 Mini'],
            devices['iPhone 12 Pro'],
            devices['iPhone 12 Pro Max'],

            devices['iPhone 13'],
            devices['iPhone 13 Mini'],
            devices['iPhone 13 Pro'],
            devices['iPhone 13 Pro Max'],

            devices['iPad (gen 6)'],
            devices['iPad (gen 7)'],
            devices['iPad Mini'],
        ];

        const randomIndex = Math.floor(
            Math.random() * deviceDescriptors.length
        );

        return deviceDescriptors[randomIndex];
    }

    private getBrowserAndContextBasedOnUserAgent() {
        const userAgent = this.getRandomUserAgent();
        return {
            browserToUse: chromium,
            browserContextOptions: {
                ...userAgent,
                extraHTTPHeaders: {
                    ...this.getFmKoreaBasicHeader(),
                },
                rawUserAgent: this.getRandomUserAgent(),
            },
        };
    }

    private extractSrlFromHrefOfPopularHotDeal(
        verboseUrl: string | null
    ): number {
        if (verboseUrl) {
            const extractedSrl = verboseUrl
                .split('document_srl=')[1]
                .split('&')[0];
            return Number(extractedSrl);
        }
        return this.srlOnError;
    }

    private refineVerboseTitleOfPopularHotDeal(
        verboseTitle: string | null
    ): string {
        if (verboseTitle) {
            return verboseTitle.trim();
        }
        return this.textPlaceHolderOnError;
    }

    private async parsePopularItem(hotDealPage: Page, isMobile: boolean) {
        const selectorForDesktop = 'tr.notice_pop1 > td.title > a:not([title])';
        const selectorForMobile = 'li.pop1 > a[href]';

        const popularItemListSelector = isMobile
            ? selectorForMobile
            : selectorForDesktop;

        const rawPopularHotDealList = await hotDealPage.$$eval(
            popularItemListSelector,
            (eachItem) => {
                return eachItem.map((anchorTag) => {
                    const rawLink = anchorTag.getAttribute('href');
                    return {
                        title: anchorTag.textContent,
                        link: rawLink,
                    };
                });
            }
        );

        return rawPopularHotDealList.map<FmKoreaPopularHotDeal>((rawData) => {
            const srl = this.extractSrlFromHrefOfPopularHotDeal(rawData.link);

            return {
                id: srl,
                title: this.refineVerboseTitleOfPopularHotDeal(rawData.title),
                link: `https://www.fmkorea.com/${srl}`,
            };
        });
    }

    private extractSrlFromHrefOfGeneralHotDeal(
        endpointWithSlash: string | null | undefined
    ): number {
        if (endpointWithSlash) {
            return Number(endpointWithSlash.replace('/', ''));
        }
        return this.srlOnError;
    }

    private refineVerboseTitleOfGeneralHotDeal(
        rawTitle: string | null | undefined
    ) {
        if (rawTitle) {
            for (let i = rawTitle.length; i >= 0; i--) {
                if (rawTitle[i] === '[') {
                    return rawTitle.slice(0, i).trim();
                }
            }
            return rawTitle.trim();
        }
        return this.textPlaceHolderOnError;
    }

    private async parseGeneralItem(
        hotDealPage: Page,
        isMobile: boolean
    ): Promise<FmKoreaGeneralHotDeal[]> {
        const generalItemListSelector = '.li.li_best2_pop0.li_best2_hotdeal0';

        const rawGeneralHotDealList = await hotDealPage.$$eval(
            generalItemListSelector,
            (eachItem, isMobile) => {
                return eachItem.map((liTag) => {
                    const [rawSellerName, rawProductPrice, rawShippingCharge] =
                        Array.from(liTag.querySelectorAll('a.strong')).map(
                            (anchorTag) => anchorTag.textContent
                        );

                    const rawTitleAndLink = liTag.querySelector('h3.title > a');

                    const categorySelector = isMobile
                        ? 'span.category'
                        : 'span.category > a';

                    const rawCategory = liTag.querySelector(categorySelector);

                    return {
                        isValid:
                            rawTitleAndLink?.className?.trim() ===
                            'hotdeal_var8',
                        title: rawTitleAndLink?.textContent,
                        link:
                            rawTitleAndLink?.getAttribute('href') ??
                            `/${this.srlOnError}`,
                        seller: rawSellerName,
                        productPrice: rawProductPrice,
                        shippingCharge: rawShippingCharge,
                        category: rawCategory?.textContent
                            ?.trim()
                            .replace(/\//g, '')
                            .trim(),
                    };
                });
            },
            isMobile
        );

        return rawGeneralHotDealList
            .filter((deal) => deal.isValid)
            .map<FmKoreaGeneralHotDeal>((validDeal) => {
                const {
                    title,
                    link,
                    seller,
                    productPrice,
                    shippingCharge,
                    category,
                } = validDeal;

                const srl = this.extractSrlFromHrefOfGeneralHotDeal(link);

                return {
                    id: srl,
                    title: this.refineVerboseTitleOfGeneralHotDeal(title),
                    link: `https://www.fmkorea.com/${srl}`,
                    seller: seller ?? this.textPlaceHolderOnError,
                    productPrice: productPrice ?? this.textPlaceHolderOnError,
                    shippingCharge:
                        shippingCharge ?? this.textPlaceHolderOnError,
                    category: category ?? this.textPlaceHolderOnError,
                };
            });
    }

    private async parseHotDeal(): Promise<FmKoreaTotalHotDeal> {
        const { browserToUse, browserContextOptions } =
            this.getBrowserAndContextBasedOnUserAgent();
        const browser = await browserToUse.launch();
        const context = await browser.newContext(browserContextOptions);

        try {
            const page = await context.newPage();

            page.on('request', async (req) => {
                const header = await req.allHeaders();
                if (header['cookie'] && header['cookie'].includes('idntm5')) {
                    console.log(
                        `[fmkorea][credential] idntm5 value: ${
                            header['cookie'].split('idntm5=')[1].split(';')[0]
                        } / timestamp: ${new Date()} / user-agent: ${
                            header['user-agent']
                        }`
                    );
                }
            });

            await page.goto(RuntimeConfig.FMKOREA_MAIN_URL);

            const credentials = await context.cookies();

            await context.addCookies(credentials);

            await page.goto(RuntimeConfig.FMKOREA_HOT_DEAL_URL);

            const popularHotDealList = await this.parsePopularItem(
                page,
                browserContextOptions.isMobile
            );
            const generalHotDealList = await this.parseGeneralItem(
                page,
                browserContextOptions.isMobile
            );

            if (!popularHotDealList || !generalHotDealList) {
                throw new Error('An error is occurred');
            }

            console.log(`transaction result: success`);

            return {
                popular: popularHotDealList,
                general: generalHotDealList,
            };
        } catch (e) {
            throw e;
        } finally {
            await browser.close();
        }
    }
}
