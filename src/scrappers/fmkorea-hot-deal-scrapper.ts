import { chromium, webkit, devices } from 'playwright-core';
import { RuntimeConfig } from '../../infra/runtime-config';
import { Page } from '@playwright/test';
import { FmKoreaHotDeal, FmKoreaPopularHotDeal } from '../../types';

export class FmkoreaHotDealScrapper {
    private readonly placeHolderOnError = '접속 후 확인해 주세요.';
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
            devices['iPhone 11 Pro Max'],
            // devices['Galaxy S9+'],
            // devices['Desktop Chrome'],
            devices['Desktop Safari'],
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
                userAgent.defaultBrowserType === 'chromium' ? chromium : webkit,

            browserContextOptions: {
                ...userAgent,
                extraHTTPHeaders: {
                    ...this.getFmKoreaBasicHeader(),
                },
                rawUserAgent: this.getRandomUserAgent(),
            },
        };
    }

    private refineVerboseUrlOfPopularHotDeal(
        verboseUrl: string | null
    ): string {
        if (verboseUrl) {
            const extractedSrl = verboseUrl
                .split('document_srl=')[1]
                .split('&')[0];
            return `https://www.fmkorea.com/${extractedSrl}`;
        }
        return this.placeHolderOnError;
    }

    private refineVerboseTitleOfPopularHotDeal(
        verboseTitle: string | null
    ): string {
        if (verboseTitle) {
            return verboseTitle.trim();
        }
        return this.placeHolderOnError;
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
            return {
                title: this.refineVerboseTitleOfPopularHotDeal(rawData.title),
                link: this.refineVerboseUrlOfPopularHotDeal(rawData.link),
            };
        });
    }

    private refineVerboseUrlOfGeneralHotDeal(
        rawUrl: string | null | undefined
    ): string {
        if (rawUrl) {
            return `https://fmkorea.com${rawUrl}`;
        }
        return this.placeHolderOnError;
    }

    private refineVerboseTitleOfGeneralHotDeal(rawTitle: string | null) {
        if (rawTitle) {
            for (let i = rawTitle.length; i >= 0; i--) {
                if (rawTitle[i] === '[') {
                    return rawTitle.slice(0, i).trim();
                }
            }
            return rawTitle.trim();
        }
        return this.placeHolderOnError;
    }

    private async parseGeneralItem(
        hotDealPage: Page
    ): Promise<FmKoreaHotDeal[]> {
        const generalItemListSelector = '.li.li_best2_pop0.li_best2_hotdeal0';

        const rawGeneralHotDealList = await hotDealPage.$$eval(
            generalItemListSelector,
            (eachItem) => {
                return eachItem.map((liTag) => {
                    const [rawSellerName, rawProductPrice, rawShippingCharge] =
                        Array.from(liTag.querySelectorAll('a.strong')).map(
                            (anchorTag) => anchorTag.textContent
                        );

                    const rawTitleAndLink = liTag.querySelector('h3.title > a');

                    if (!rawTitleAndLink) {
                        throw new Error(
                            'Failed to get general hot deal information - title and link from fmkorea.com'
                        );
                    }

                    return {
                        isValid:
                            rawTitleAndLink.className.trim() === 'hotdeal_var8',
                        title: rawTitleAndLink.textContent,
                        link: rawTitleAndLink.getAttribute('href'),
                        detailedInfo: {
                            sellerName: rawSellerName,
                            productPrice: rawProductPrice,
                            shippingCharge: rawShippingCharge,
                        },
                    };
                });
            }
        );

        return rawGeneralHotDealList
            .filter((deal) => deal.isValid)
            .map<FmKoreaHotDeal>((validDeal) => {
                const { isValid, ...otherProps } = validDeal;
                const { title, link, detailedInfo } = otherProps;

                if (
                    !detailedInfo ||
                    !detailedInfo.sellerName ||
                    !detailedInfo.productPrice ||
                    !detailedInfo.shippingCharge ||
                    !title ||
                    !link
                ) {
                    throw new Error(
                        'Failed to extract information from general hot deal list'
                    );
                }

                return {
                    title: this.refineVerboseTitleOfGeneralHotDeal(title),
                    link: this.refineVerboseUrlOfGeneralHotDeal(link),
                    detailedInfo: {
                        sellerName: detailedInfo.sellerName,
                        productPrice: detailedInfo.productPrice,
                        shippingCharge: detailedInfo.shippingCharge,
                    },
                };
            });
    }

    public async requestDocument() {
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
                        `fmkorea transaction watcher:: idntm5 value: ${
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
            const generalHotDealList = await this.parseGeneralItem(page);

            if (!popularHotDealList || !generalHotDealList) {
                throw new Error('An error is occurred');
            }

            console.log(`transaction result: success`);
            return {
                popularHotDealList,
                generalHotDealList,
            };
        } catch (e) {
            console.error(e);
        } finally {
            await browser.close();
        }
    }
}
