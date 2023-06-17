import { PpomppuHotDealScrapper } from '../scrappers/ppomppu-hot-deal-scrapper';
import { BrokerPublisher } from '../../infra/broker/broker-publisher';
import { HotDealUpdated } from '../../infra/broker/events/hot-deal-updated';
import { ENV_LIST } from '../../infra/env-config';
import { HOT_DEAL_SOURCE } from '../../infra/enums';

export const ppomppuHotDealPeriodically = async () => {
    const ppomppuScrapper = new PpomppuHotDealScrapper();
    const publisher = await BrokerPublisher.get();

    try {
        const job = async () => {
            const refreshedDealList =
                await ppomppuScrapper.getRefreshedHotDealList();

            const eventForGeneral: HotDealUpdated = {
                version: ENV_LIST.HOT_DEAL_UPDATED_EVENT_VERSION,
                hotDealSource: HOT_DEAL_SOURCE.PPOMPPU_GENERAL,
                timestamp: new Date(),
                listOfHotDeal: refreshedDealList,
            };

            await publisher.produce({
                message: eventForGeneral,
            });

            setTimeout(
                job,
                1000 * 60 * 5 + Math.floor(Math.random() * 500) * 1000
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
