import { FmKoreaHotDealScrapper } from '../scrappers/fm-korea-hot-deal-scrapper';
import { BrokerPublisher } from '../../infra/broker/broker-publisher';
import { HotDealUpdated } from '../../infra/broker/events/hot-deal-updated';
import { ENV_LIST } from '../../infra/env-config';
import { HOT_DEAL_SOURCE } from '../../infra/enums';
import { DuplicateTableRepository } from '../repositories/duplicate-table-repository';

export const fmKoreaHotDealPeriodically = async () => {
    const fmKoreaScrapper = new FmKoreaHotDealScrapper(
        new DuplicateTableRepository()
    );
    const publisher = await BrokerPublisher.get();

    try {
        const job = async () => {
            const { popular, general } =
                await fmKoreaScrapper.getRefreshedHotDealList();

            if (popular.length > 0) {
                const eventForPopular: HotDealUpdated = {
                    version: ENV_LIST.HOT_DEAL_UPDATED_EVENT_VERSION,
                    hotDealSource: HOT_DEAL_SOURCE.FMKOREA_POPULAR,
                    timestamp: new Date(),
                    listOfHotDeal: popular,
                };

                await publisher.produce({
                    message: eventForPopular,
                });
            }

            if (general.length > 0) {
                const eventForGeneral: HotDealUpdated = {
                    version: ENV_LIST.HOT_DEAL_UPDATED_EVENT_VERSION,
                    hotDealSource: HOT_DEAL_SOURCE.FMKOREA_GENERAL,
                    timestamp: new Date(),
                    listOfHotDeal: general,
                };

                await publisher.produce({
                    message: eventForGeneral,
                });
            }

            setTimeout(
                job,
                1_000 * 60 + Math.floor(Math.random() * 60) * 1_000
            );
        };

        await job();
    } catch (e) {
        if (publisher) {
            await publisher.destroy();
        }
        throw e;
    }
};
