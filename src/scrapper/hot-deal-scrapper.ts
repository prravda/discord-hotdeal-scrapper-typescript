import axios from 'axios';
import { RuntimeConfig } from '../../infra/runtime-config';
import { JSDOM } from 'jsdom';
import { decode } from 'iconv-lite';

export class HotDealScrapper {
    public async requestDocument() {
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
        const { document } = new JSDOM(decode(result.data, 'EUC-KR')).window;
        // @ts-ignore
        const hotDealTableLinks = document.body
            .querySelector('.board_table')
            .querySelectorAll('a.title:not([style])');

        console.log(`현재 유효한 뽐뿌 핫딜 목록이에요!`);

        const dealList: { title: string | null; link: string }[] = [];

        hotDealTableLinks.forEach((eachHotDeal) => {
            const baseUrl = 'https://www.ppomppu.co.kr';
            const dealLink = eachHotDeal.getAttribute('href');
            const title = eachHotDeal.textContent;

            dealList.push({
                title,
                link: `${baseUrl}${dealLink}`,
            });
        });

        console.log(dealList);

        return dealList;
    }
}
