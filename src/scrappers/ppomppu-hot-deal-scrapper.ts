import axios from 'axios';
import { RuntimeConfig } from '../../infra/runtime-config';
import { JSDOM } from 'jsdom';
import { decode } from 'iconv-lite';
import { BasicHotDeal } from '../../types';

export class PpomppuHotDealScrapper {
    public async requestDocument() {
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
            const { document } = new JSDOM(decode(result.data, 'EUC-KR'))
                .window;

            const hotDealTableLinks = document.body
                ?.querySelector<HTMLTableElement>('.board_table')
                ?.querySelectorAll<HTMLAnchorElement>('a.title:not([style])');

            const dealList: BasicHotDeal[] = [];

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
                    title: title ? title : '링크 접속 후 확인해주세요!',
                    link: `${baseUrl}${dealLink}`,
                });
            });

            return dealList;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
