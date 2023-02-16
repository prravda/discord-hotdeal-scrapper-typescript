import { RuntimeConfig } from '../../infra/runtime-config';
import { BasicHotDeal, FmKoreaHotDeal } from '../../types';
import puppeteer from 'puppeteer';

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
    public async requestDocument() {
        try {
            const browser = await puppeteer.launch({
                product: 'chrome',
            });
            console.log(`puppeteer instance is running...`);

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

            const hotDealList = await page.evaluate((userAgentToUse) => {
                const popularItemList: BasicHotDeal[] = [];
                const generalItemList: FmKoreaHotDeal[] = [];

                const popularItemSelector =
                    userAgentToUse['sec-ch-ua-mobile'] === '?0'
                        ? 'tr.notice_pop1 > td.title > a:not([title])'
                        : 'li.pop1 > a[href]';

                const rawPopularItemList =
                    document.querySelectorAll(popularItemSelector);

                rawPopularItemList.forEach((p) =>
                    popularItemList.push({
                        title:
                            p.textContent ??
                            '핫 딜 결과를 가져오는 도중 오류가 발생하였습니다.',
                        link:
                            `https://fmkorea.com${p.getAttribute('href')}` ??
                            '핫 딜 결과를 가져오는 도중 오류가 발생하였습니다.',
                    })
                );

                document
                    .querySelectorAll('.li.li_best2_pop0.li_best2_hotdeal0')
                    .forEach((p) => {
                        const rawTitle = p.querySelector('.hotdeal_var8');

                        const rawInfo: string[] = [];
                        p.querySelectorAll('.strong').forEach((info) => {
                            rawInfo.push(info.innerHTML);
                        });

                        const [sellerName, productPrice, shippingCharge] =
                            rawInfo;

                        generalItemList.push({
                            title:
                                rawTitle?.textContent
                                    ?.trim()
                                    .split('\t')[0]
                                    .trim() ??
                                '핫 딜 결과를 가져오는 도중 오류가 발생하였습니다.',
                            link: rawTitle?.getAttribute('href')
                                ? `https://fmkorea.com${rawTitle?.getAttribute(
                                      'href'
                                  )}`
                                : '핫 딜 결과를 가져오는 도중 오류가 발생하였습니다.',
                            detailedInfo: {
                                sellerName,
                                productPrice,
                                shippingCharge,
                            },
                        });
                    });

                return { popularItemList, generalItemList };
            }, userAgentToUse);

            await browser.close();

            return hotDealList;
        } catch (e) {
            console.error(e);
        }
    }
}

const instance = new FmKoreaHotDealScrapper();
instance.requestDocument().then((d) => console.log(JSON.stringify(d)));
