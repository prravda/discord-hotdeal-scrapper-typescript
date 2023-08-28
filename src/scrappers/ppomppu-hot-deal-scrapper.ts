import axios from 'axios';
import { RUNTIME_CONFIG } from '../../infra/runtime-config';
import { parseHTML } from 'linkedom';
import { decode } from 'iconv-lite';
import { PpomppuHotDeal } from '../../types';
import { LokiLogger } from '../../infra/logger/loki-logger';
import { DuplicateTableRepositoryInterface } from '../repositories/duplicate-table-repository.interface';
import { generateHash } from '../helpers/generate-hash';
import { PPOMPPU_AUXILIARY } from '../common/SCRAPPER_AUXIILARIES';

export class PpomppuHotDealScrapper {
    private readonly ppomppuBaseUrl: string = 'https://www.ppomppu.co.kr';
    private readonly srlOnError: number = 999_999_999;
    private readonly textPlaceHolderOnError: string = '접속 후 확인해 주세요';

    constructor(
        private readonly duplicateTableRepository: DuplicateTableRepositoryInterface
    ) {}

    public async getRefreshedHotDealList() {
        try {
            // getting hot deal
            const hotDealList = await this.parseHotDeal();

            // validate through redis and get fresh hot deal only
            const validateResult = await Promise.all(
                hotDealList.map(
                    async (hotDeal) => await this.checkNewHotDeal(hotDeal)
                )
            );

            // finally, extract only fresh hot deal
            const refreshHotDealList = hotDealList.filter(
                (_, idx) => validateResult[idx]
            );

            // send log via loki
            refreshHotDealList.forEach((eachRefreshedHotDeal) => {
                const { id, title } = eachRefreshedHotDeal;
                LokiLogger.getLogger().info({
                    labels: {
                        origin: 'ppomppu',
                        target: 'hotdeal',
                        dealType: 'general',
                    },
                    message: {
                        id,
                        title,
                        hash: generateHash(id, title),
                    },
                });
            });

            // return fresh hot deal
            return refreshHotDealList;
        } catch (e) {
            throw e;
        }
    }

    private async checkNewHotDeal(hotDeal: PpomppuHotDeal) {
        const hashKey = generateHash(hotDeal.id, hotDeal.title);
        return this.duplicateTableRepository.isNewHotDeal(hashKey);
    }
    private async parseHotDeal() {
        try {
            const result = await axios.request({
                url: RUNTIME_CONFIG.PPOMPPU_HOT_DEAL_URL,
                headers: PPOMPPU_AUXILIARY.BASIC_HEADERS,
                method: 'GET',
                responseType: 'arraybuffer',
                responseEncoding: 'binary',
            });
            const { document } = parseHTML(decode(result.data, 'EUC-KR'));

            const hotDealTableLinks = document.body
                .querySelector<HTMLTableElement>(
                    PPOMPPU_AUXILIARY.SELECTOR.HOT_DEAL_TABLE
                )
                ?.querySelectorAll<HTMLAnchorElement>(
                    PPOMPPU_AUXILIARY.SELECTOR.EACH_HOT_DEAL_ANCHOR_TAG
                );

            if (!hotDealTableLinks) {
                throw new Error(
                    'An error is occurred while getting ppomppu hot deal'
                );
            }

            return Array.from(hotDealTableLinks).map<PpomppuHotDeal>(
                (eachHotDeal) => {
                    const dealLink = eachHotDeal.getAttribute('href');
                    const title: string | null = eachHotDeal.textContent;

                    const id = dealLink
                        ? Number(dealLink.split('&no=')[1])
                        : this.srlOnError;
                    const trimmedTitle = title
                        ? title.trim()
                        : this.textPlaceHolderOnError;
                    const link = `${this.ppomppuBaseUrl}${dealLink}`;

                    return {
                        id,
                        title: trimmedTitle,
                        link,
                    };
                }
            );
        } catch (e: unknown) {
            const errorAsErrorObject = e as Error;
            LokiLogger.getLogger().error({
                label: {
                    origin: 'ppomppu',
                },
                message: { stack: errorAsErrorObject.stack },
            });
            throw e;
        }
    }
}
