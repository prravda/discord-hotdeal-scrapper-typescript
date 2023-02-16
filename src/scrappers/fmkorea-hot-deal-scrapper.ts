import { RuntimeConfig } from '../../infra/runtime-config';
import { BasicHotDeal, FmKoreaHotDeal } from '../../types';
import puppeteer from 'puppeteer';

export class FmKoreaHotDealScrapper {
    public async requestDocument() {
        try {
            const browser = await puppeteer.launch({
                product: 'chrome',
                headless: false,
            });
            console.log(`puppeteer instance is running...`);

            const page = await browser.newPage();
            await page.goto(RuntimeConfig.FMKOREA_MAIN_URL);

            console.log(`getting credentials...`);
            const credentials = await page.cookies();

            console.log(`setting up credential...`);
            await page.setCookie(...credentials);

            await page.goto(RuntimeConfig.FMKOREA_HOT_DEAL_URL);

            const hotDealList = await page.evaluate(() => {
                const popularItemList: BasicHotDeal[] = [];
                const generalItemList: FmKoreaHotDeal[] = [];

                document
                    .querySelectorAll(
                        'tr.notice_pop1 > td.title > a:not([title])'
                    )
                    .forEach((p) =>
                        popularItemList.push({
                            title: p.innerHTML.trim(),
                            link:
                                `https://fmkorea.com${p.getAttribute(
                                    'href'
                                )}` ??
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
            });

            await browser.close();

            return hotDealList;
        } catch (e) {
            console.error(e);
        }
    }
}
