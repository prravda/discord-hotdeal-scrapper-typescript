import { PpomppuHotDealScrapper } from '../scrappers/ppomppu-hot-deal-scrapper';
import { BrokerPublisher } from '../../infra/broker/broker-publisher';
import { HotDealUpdated } from '../../infra/broker/events/hot-deal-updated';
import { ENV_LIST } from '../../infra/env-config';
import { HOT_DEAL_SOURCE } from '../../infra/enums';
import { DuplicateTableRepository } from '../repositories/duplicate-table-repository';

export const ppomppuHotDealPeriodically = async () => {
    const ppomppuScrapper = new PpomppuHotDealScrapper(
        new DuplicateTableRepository()
    );
    const publisher = await BrokerPublisher.get();

    try {
        const job = async () => {
            const refreshedDealList =
                await ppomppuScrapper.getRefreshedHotDealList();

            if (refreshedDealList.length > 0) {
                const eventForGeneral: HotDealUpdated = {
                    version: ENV_LIST.HOT_DEAL_UPDATED_EVENT_VERSION,
                    hotDealSource: HOT_DEAL_SOURCE.PPOMPPU_GENERAL,
                    timestamp: new Date(),
                    listOfHotDeal: refreshedDealList,
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
