import { RuntimeConfig } from '../../infra/runtime-config';
import { FmKoreaHotDeal, FmKoreaPopularHotDeal } from '../../types';
import puppeteer, { Page } from 'puppeteer';

const fmKoreaHttp2Headers = {
    ':path': '/',
    ':scheme': 'https',
};

const fmKoreaBasicHeaders: { [key: string]: string } = {
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

interface UserAgentPair {
    'sec-ch-ua-mobile': '?0' | '?1';
    'sec-ch-ua-platform':
        | 'Android'
        | 'Chrome OS'
        | 'Chromium OS'
        | 'iOS'
        | 'Linux'
        | 'macOS'
        | 'Windows'
        | 'Unknown';

    'user-agent': string;
}

export class FmKoreaHotDealScrapper {
    private getRandomUserAgentPair(): UserAgentPair {
        const userAgentPool = {
            iphone: 'Mozilla/5.0 (iPhone12,1; U; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/15E148 Safari/602.1',
            galaxy: 'Mozilla/5.0 (Linux; Android 12; SM-N970U Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/110.0.5481.40 Mobile Safari/537.36',
            windowDesktop:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
            macbook:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9',
        };

        const compositedAgents: UserAgentPair[] = [
            // galaxy note 10
            {
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': 'Android',
                'user-agent': userAgentPool.galaxy,
            },
            // iphone 11 pro max
            {
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': 'iOS',
                'user-agent': userAgentPool.iphone,
            },
            // windows desktop
            {
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': 'Windows',
                'user-agent': userAgentPool.windowDesktop,
            },
            // macbook
            {
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': 'macOS',
                'user-agent': userAgentPool.macbook,
            },
        ];

        const randomIndex = Math.floor(Math.random() * compositedAgents.length);

        return compositedAgents[randomIndex];
    }

    private async parsePopularItem(
        hotDealPage: Page,
        userAgentPair: UserAgentPair
    ): Promise<FmKoreaPopularHotDeal[]> {
        try {
            // case of desktop
            const selectorForDesktop =
                'tr.notice_pop1 > td.title > a:not([title])';
            // case of mobile
            const selectorForMobile = 'li.pop1 > a[href]';

            const popularItemListSelector =
                userAgentPair['sec-ch-ua-mobile'] === '?0'
                    ? selectorForDesktop
                    : selectorForMobile;

            return await hotDealPage.evaluate((popularItemListSelector) => {
                const listOfAnchorElement = Array.from<HTMLAnchorElement>(
                    document.querySelectorAll<HTMLAnchorElement>(
                        popularItemListSelector
                    )
                );
                const refineVerboseUrl = (
                    verboseUrl: string | null
                ): string => {
                    if (verboseUrl) {
                        const extractedSrl = verboseUrl
                            .split('?')[1]
                            .split('&')[1]
                            .split('=')[1];
                        return `https://www.fmkorea.com/${extractedSrl}`;
                    }
                    return '접속 후 확인해 주세요.';
                };

                return listOfAnchorElement.map<FmKoreaPopularHotDeal>((a) => {
                    const rawLink = a.getAttribute('href');

                    return {
                        title: a.innerText.trim(),
                        link: refineVerboseUrl(rawLink),
                    };
                });
            }, popularItemListSelector);
        } catch (e) {
            throw e;
        }
    }

    private async parseGeneralItem(
        hotDealPage: Page
    ): Promise<FmKoreaHotDeal[]> {
        try {
            const generalItemListSelector =
                '.li.li_best2_pop0.li_best2_hotdeal0';

            return await hotDealPage.evaluate((generalItemListSelector) => {
                const rawListOfGeneralHotDeal = Array.from<HTMLLIElement>(
                    document.querySelectorAll<HTMLLIElement>(
                        generalItemListSelector
                    )
                );

                return rawListOfGeneralHotDeal.map<FmKoreaHotDeal>((r) => {
                    const [sellerName, productPrice, shippingCharge] =
                        Array.from<HTMLAnchorElement>(
                            r.querySelectorAll<HTMLAnchorElement>('a.strong')
                        ).map((a) => a.innerText.trim());

                    const rawTitleAndLink =
                        r.querySelector<HTMLAnchorElement>('h3.title > a');

                    if (!rawTitleAndLink) {
                        console.error(rawTitleAndLink);
                        throw new Error(
                            `failed to getting the list of title and link html element of general item list`
                        );
                    }

                    const placeHolderMessageForInvalidLink =
                        '페이지에 직접 접속 후 확인 필요';

                    const trimAndRemoveCommentSection = (
                        rawString: string
                    ): string => {
                        for (let i = rawString.length; i >= 0; i--) {
                            if (rawString[i] === '[') {
                                return rawString.slice(0, i).trim();
                            }
                        }
                        return rawString.trim();
                    };

                    const title = trimAndRemoveCommentSection(
                        rawTitleAndLink.innerText
                    );

                    const link = rawTitleAndLink.getAttribute('href')
                        ? `https://fmkorea.com${rawTitleAndLink.getAttribute(
                              'href'
                          )}`
                        : placeHolderMessageForInvalidLink;

                    if (
                        !sellerName ||
                        !productPrice ||
                        !shippingCharge ||
                        !title ||
                        link === placeHolderMessageForInvalidLink
                    ) {
                        throw new Error(
                            `failed to getting general hot deal information`
                        );
                    }

                    return {
                        title,
                        link,
                        detailedInfo: {
                            sellerName,
                            productPrice,
                            shippingCharge,
                        },
                    };
                });
            }, generalItemListSelector);
        } catch (e) {
            throw e;
        }
    }

    public async requestDocument() {
        const browser = await puppeteer.launch({
            product: 'chrome',
        });
        console.log(`puppeteer instance is running...`);

        try {
            const page = await browser.newPage();
            await page.goto(RuntimeConfig.FMKOREA_MAIN_URL);

            console.log(`getting credentials...`);
            const credentials = await page.cookies();

            console.log(`setting up credential...`);
            const userAgentToUse = this.getRandomUserAgentPair();

            await page.setCookie(...credentials);
            await page.setExtraHTTPHeaders({
                ...fmKoreaBasicHeaders,
                'sec-ch-ua-platform': userAgentToUse['sec-ch-ua-platform'],
                'sec-ch-ua-mobile': userAgentToUse['sec-ch-ua-mobile'],
            });
            await page.setUserAgent(userAgentToUse['user-agent']);

            await page.goto(RuntimeConfig.FMKOREA_HOT_DEAL_URL);

            const popularHotDealList = await this.parsePopularItem(
                page,
                userAgentToUse
            );
            const generalHotDealList = await this.parseGeneralItem(page);

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
