import { chromium, devices } from 'playwright-core';
import { RUNTIME_CONFIG } from '../../infra/runtime-config';
import { Page, webkit } from 'playwright';
import {
    BasicHotDeal,
    FmKoreaGeneralHotDeal,
    FmKoreaPopularHotDeal,
    FmKoreaTotalHotDeal,
} from '../../types';
import { LokiLogger } from '../../infra/logger/loki-logger';
import { FMKOREA_AUXILIARY } from '../common/SCRAPPER_AUXIILARIES';
import { DuplicateTableRepositoryInterface } from '../repositories/duplicate-table-repository.interface';
import { generateHash } from '../helpers/generate-hash';

export class FmKoreaHotDealScrapper {
    private readonly srlOnError: number = 999_999_999;
    private readonly textPlaceHolderOnError = '접속 후 확인해 주세요';

    constructor(
        private readonly duplicateTableRepository: DuplicateTableRepositoryInterface
    ) {}

    public async getRefreshedHotDealList(): Promise<FmKoreaTotalHotDeal> {
        try {
            const { popular, general } = await this.parseHotDeal();

            const filteredPopularHotDealList =
                await this.extractNewHotDeal<FmKoreaPopularHotDeal>(popular);
            const filteredGeneralHotDealList =
                await this.extractNewHotDeal<FmKoreaGeneralHotDeal>(general);

            // logging
            filteredPopularHotDealList.forEach(
                (eachRefreshedPopularHotDeal) => {
                    const { id, title } = eachRefreshedPopularHotDeal;
                    const hash = generateHash(id, title, 'popular');

                    LokiLogger.getLogger().info({
                        labels: {
                            origin: 'fmkorea',
                            target: 'hotdeal',
                            dealType: 'popular',
                        },
                        message: {
                            id,
                            title,
                            hash,
                        },
                    });
                }
            );

            filteredGeneralHotDealList.forEach(
                (eachRefreshedGeneralHotDeal) => {
                    const { id, title } = eachRefreshedGeneralHotDeal;
                    const hash = generateHash(id, title);

                    LokiLogger.getLogger().info({
                        labels: {
                            origin: 'fmkorea',
                            target: 'hotdeal',
                            dealType: 'general',
                        },
                        message: {
                            id,
                            title,
                            hash,
                        },
                    });
                }
            );

            return {
                popular: filteredPopularHotDealList,
                general: filteredGeneralHotDealList,
            };
        } catch (e) {
            throw e;
        }
    }

    private async extractNewHotDeal<T extends BasicHotDeal>(hotDealList: T[]) {
        const validateResult = await Promise.all(
            hotDealList.map(
                async (hotDeal) => await this.checkNewHotDeal<T>(hotDeal)
            )
        );

        return hotDealList.filter((_, idx) => validateResult[idx]);
    }

    private async checkNewHotDeal<T extends BasicHotDeal>(hotDeal: T) {
        // case of general hot deal
        if ('category' in hotDeal) {
            const hashKey = generateHash(hotDeal.id, hotDeal.title);
            return this.duplicateTableRepository.isNewHotDeal(hashKey);
        }
        // case of popular hot deal
        const hashKey = generateHash(hotDeal.id, hotDeal.title, 'popular');
        return this.duplicateTableRepository.isNewHotDeal(hashKey);
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
            browserToUse:
                userAgent.defaultBrowserType === 'webkit' ? webkit : chromium,
            browserContextOptions: {
                ...userAgent,
                extraHTTPHeaders: FMKOREA_AUXILIARY.BASIC_HEADERS,
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
        const popularItemListSelector = isMobile
            ? FMKOREA_AUXILIARY.SELECTOR.POPULAR_HOT_DEAL.ITEM_LIST.FOR_MOBILE
            : FMKOREA_AUXILIARY.SELECTOR.POPULAR_HOT_DEAL.ITEM_LIST.FOR_DESKTOP;

        const rawPopularHotDealList = await hotDealPage
            .locator(popularItemListSelector)
            .evaluateAll((eachItem) => {
                return eachItem.map((anchorTag) => {
                    const rawLink = anchorTag.getAttribute('href');
                    return {
                        title: anchorTag.textContent,
                        link: rawLink,
                    };
                });
            });

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
        const selectors = FMKOREA_AUXILIARY.SELECTOR.GENERAL_HOT_DEAL;
        const informationForTraversing = {
            isMobile,
            selectors,
        };

        const rawGeneralHotDealList = await hotDealPage
            .locator(selectors.ITEM_LIST)
            .evaluateAll((eachItem, informationForTraversing) => {
                const { isMobile, selectors } = informationForTraversing;
                const { ADDITIONAL_INFO, TITLE_AND_LINK, CATEGORY } = selectors;
                return eachItem.map((liTag) => {
                    const [rawSellerName, rawProductPrice, rawShippingCharge] =
                        Array.from(liTag.querySelectorAll(ADDITIONAL_INFO)).map(
                            (anchorTag) => anchorTag.textContent
                        );

                    const rawTitleAndLink = liTag.querySelector(TITLE_AND_LINK);

                    const categorySelector = isMobile
                        ? CATEGORY.FOR_MOBILE
                        : CATEGORY.FOR_DESKTOP;

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
            }, informationForTraversing);

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
                const cookie = header['cookie'] || '';

                const matcherForFingerPrint = /idntm5=(.*?);/;
                const fingerPrintMatch = cookie.match(matcherForFingerPrint);

                if (fingerPrintMatch) {
                    const [, fingerPrint] = fingerPrintMatch;
                    const { 'user-agent': userAgent } = header;

                    LokiLogger.getLogger().info({
                        labels: { origin: 'fmkorea', target: 'credential' },
                        message: { fingerPrint, userAgent },
                    });
                }
            });

            await page.goto(RUNTIME_CONFIG.FMKOREA_MAIN_URL);

            const credentials = await context.cookies();

            await context.addCookies(credentials);

            await page.goto(RUNTIME_CONFIG.FMKOREA_HOT_DEAL_URL);

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

            return {
                popular: popularHotDealList,
                general: generalHotDealList,
            };
        } catch (e) {
            const errorAsErrorObject = e as Error;
            LokiLogger.getLogger().error({
                label: {
                    origin: 'fmkorea',
                },
                message: `error=${errorAsErrorObject.stack}`,
            });
            throw e;
        } finally {
            await context.close();
            await browser.close();
        }
    }
}
