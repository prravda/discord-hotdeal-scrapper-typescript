import { FmkoreaHotDealScrapper } from '../scrappers/fmkorea-hot-deal-scrapper';
import { BrokerPublisher } from '../../infra/broker/broker-publisher';
import { HotDealUpdated } from '../../infra/broker/events/hot-deal-updated';
import { ENV_LIST } from '../../infra/env-config';
import { HOT_DEAL_SOURCE } from '../../infra/enums';

export const fmKoreaHotDealPeriodically = async () => {
    const fmKoreaScrapper = new FmkoreaHotDealScrapper();
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
                1000 * 60 * 4 + Math.floor(Math.random() * 567) * 1000
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
